import { createHmac } from 'node:crypto';
import { revalidateTag } from 'next/cache';
import { createManagementApiClient } from '@storyblok/management-api-client';
import { safeEqual } from '@/lib/safeEqual';
import { storyTag } from '@/lib/storyTag';

// This module alone imports the Management API client, so the management
// token and the webhook secret stay out of every page render and the browser.

const HANDLED_ACTIONS = new Set([
	'published',
	'unpublished',
	'deleted',
	'moved',
]);
const STORIES_PER_PAGE = 100;

// The Management API call failed after the story's own tag went stale.
const upstreamFailure = () =>
	new Response('Could not look up referencing stories', { status: 502 });

/**
 * Whether the `webhook-signature` header is the lowercase hex HMAC-SHA1 of the
 * raw request body, keyed with STORYBLOK_WEBHOOK_SECRET. Without a secret,
 * nothing is valid.
 */
function hasValidSignature(request, rawBody) {
	const secret = process.env.STORYBLOK_WEBHOOK_SECRET;
	const signature = request.headers.get('webhook-signature');
	if (!secret || !signature) return false;
	const expected = createHmac('sha1', secret).update(rawBody).digest('hex');
	return safeEqual(signature, expected);
}

// The ids of every story whose content references the story with this UUID,
// one level deep, across all pages of the Management API's story list.
async function findReferencingStoryIds(storyUuid) {
	const token = process.env.STORYBLOK_MANAGEMENT_TOKEN;
	if (!token) throw new Error('STORYBLOK_MANAGEMENT_TOKEN is not set');
	const client = createManagementApiClient({
		personalAccessToken: token,
		region: process.env.STORYBLOK_REGION || 'eu',
		spaceId: Number(process.env.STORYBLOK_SPACE_ID),
		throwOnError: true,
	});
	const ids = [];
	for (let page = 1; ; page++) {
		const { data } = await client.stories.list({
			query: {
				reference_search: storyUuid,
				per_page: STORIES_PER_PAGE,
				page,
			},
		});
		const stories = data.stories ?? [];
		ids.push(...stories.map((story) => story.id));
		if (stories.length < STORIES_PER_PAGE) return ids;
	}
}

/**
 * Receives Storyblok story webhooks. A signed published, unpublished, deleted
 * or moved event revalidates `story-<id>` for the story and for every story
 * that references it. The route answers every other event with 200 and does
 * nothing else.
 *
 * When the lookup of referencing stories fails, the route has revalidated the
 * story's own tag and answers 502, so Storyblok retries the delivery. A retry
 * repeats idempotent revalidation.
 */
export async function POST(request) {
	// The signature covers the raw text, so read it before any JSON parsing.
	const rawBody = await request.text();
	if (!hasValidSignature(request, rawBody)) {
		return new Response('Unauthorized', { status: 401 });
	}

	let payload;
	try {
		payload = JSON.parse(rawBody);
	} catch {
		return new Response('Invalid JSON', { status: 400 });
	}

	if (!HANDLED_ACTIONS.has(payload?.action)) {
		return new Response('Ignored', { status: 200 });
	}

	const { story_id: storyId, story_uuid: storyUuid } = payload;
	if (!storyId || !storyUuid) {
		return new Response('Missing story_id or story_uuid', { status: 400 });
	}

	const revalidated = new Set([storyId]);
	revalidateTag(storyTag(storyId), 'max');

	try {
		for (const referencingId of await findReferencingStoryIds(storyUuid)) {
			if (revalidated.has(referencingId)) continue;
			revalidated.add(referencingId);
			revalidateTag(storyTag(referencingId), 'max');
		}
	} catch (error) {
		console.error('Revalidate webhook: referencing story lookup failed', error);
		return upstreamFailure();
	}

	return Response.json({ revalidated: revalidated.size });
}
