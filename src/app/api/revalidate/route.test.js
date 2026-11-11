import { createHmac } from 'node:crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { revalidateTag, listStories, createManagementApiClient } = vi.hoisted(
	() => {
		const listStories = vi.fn();
		return {
			revalidateTag: vi.fn(),
			listStories,
			createManagementApiClient: vi.fn(() => ({
				stories: { list: listStories },
			})),
		};
	},
);

vi.mock('next/cache', () => ({ revalidateTag }));
vi.mock('@storyblok/management-api-client', () => ({
	createManagementApiClient,
}));

import { POST } from './route';

const SECRET = 'webhook-secret';
const sign = (body, secret = SECRET) =>
	createHmac('sha1', secret).update(body).digest('hex');

const storyPayload = (overrides = {}) => ({
	text: 'The user published the story',
	action: 'published',
	space_id: 12345,
	story_id: 111,
	story_uuid: 'uuid-111',
	full_slug: 'destinations/lisbon',
	...overrides,
});

// A request whose signature covers exactly the body text sent.
const webhookRequest = (payload, { signature, body } = {}) => {
	const rawBody = body ?? JSON.stringify(payload);
	const headers = {};
	const webhookSignature = signature === undefined ? sign(rawBody) : signature;
	if (webhookSignature !== null)
		headers['webhook-signature'] = webhookSignature;
	return new Request('http://localhost:3000/api/revalidate', {
		method: 'POST',
		headers,
		body: rawBody,
	});
};

const referencedBy = (...ids) =>
	listStories.mockResolvedValueOnce({
		data: { stories: ids.map((id) => ({ id })) },
	});

const revalidatedTags = () => revalidateTag.mock.calls.map(([tag]) => tag);

beforeEach(() => {
	vi.clearAllMocks();
	vi.stubEnv('STORYBLOK_WEBHOOK_SECRET', SECRET);
	vi.stubEnv('STORYBLOK_MANAGEMENT_TOKEN', 'management-token');
	vi.stubEnv('STORYBLOK_SPACE_ID', '12345');
	vi.stubEnv('STORYBLOK_REGION', 'eu');
	listStories.mockReset();
});

describe('signature', () => {
	it('rejects a request without a signature', async () => {
		const response = await POST(
			webhookRequest(storyPayload(), { signature: null }),
		);
		expect(response.status).toBe(401);
		expect(revalidateTag).not.toHaveBeenCalled();
		expect(listStories).not.toHaveBeenCalled();
	});

	it('rejects a signature made with another secret', async () => {
		const body = JSON.stringify(storyPayload());
		const response = await POST(
			webhookRequest(null, { body, signature: sign(body, 'other-secret') }),
		);
		expect(response.status).toBe(401);
		expect(revalidateTag).not.toHaveBeenCalled();
	});

	it('rejects a signature of the wrong length', async () => {
		const response = await POST(
			webhookRequest(storyPayload(), { signature: 'abc' }),
		);
		expect(response.status).toBe(401);
		expect(revalidateTag).not.toHaveBeenCalled();
	});

	it('rejects a body altered after signing', async () => {
		const signature = sign(JSON.stringify(storyPayload()));
		const tampered = JSON.stringify(storyPayload({ story_id: 999 }));
		const response = await POST(
			webhookRequest(null, { body: tampered, signature }),
		);
		expect(response.status).toBe(401);
		expect(revalidateTag).not.toHaveBeenCalled();
	});

	it('rejects every request when the secret is not configured', async () => {
		vi.stubEnv('STORYBLOK_WEBHOOK_SECRET', '');
		const body = JSON.stringify(storyPayload());
		const response = await POST(
			webhookRequest(null, { body, signature: sign(body, '') }),
		);
		expect(response.status).toBe(401);
		expect(revalidateTag).not.toHaveBeenCalled();
	});

	it('verifies the signature over the raw text, not re-serialised JSON', async () => {
		const body =
			'{ "action" : "published",\n "story_id": 111, "story_uuid": "uuid-111" }';
		referencedBy();
		const response = await POST(webhookRequest(null, { body }));
		expect(response.status).toBe(200);
		expect(revalidatedTags()).toEqual(['story-111']);
	});
});

describe.each(['published', 'unpublished', 'deleted', 'moved'])(
	'%s',
	(action) => {
		it('revalidates the story and every story that references it', async () => {
			referencedBy(222, 333);
			const response = await POST(webhookRequest(storyPayload({ action })));
			expect(response.status).toBe(200);
			expect(revalidatedTags().sort()).toEqual([
				'story-111',
				'story-222',
				'story-333',
			]);
			for (const [, profile] of revalidateTag.mock.calls) {
				expect(profile).toBe('max');
			}
		});
	},
);

describe('Management API call', () => {
	it('searches the configured space by story UUID with the token and region', async () => {
		referencedBy(222);
		await POST(webhookRequest(storyPayload()));
		expect(createManagementApiClient).toHaveBeenCalledWith(
			expect.objectContaining({
				personalAccessToken: 'management-token',
				region: 'eu',
				spaceId: 12345,
			}),
		);
		expect(listStories).toHaveBeenCalledWith(
			expect.objectContaining({
				query: expect.objectContaining({
					reference_search: 'uuid-111',
					page: 1,
				}),
			}),
		);
	});

	it('walks every page of referencing stories', async () => {
		const fullPage = Array.from({ length: 100 }, (_story, index) => ({
			id: 1000 + index,
		}));
		listStories
			.mockResolvedValueOnce({ data: { stories: fullPage } })
			.mockResolvedValueOnce({ data: { stories: [{ id: 5000 }] } });
		const response = await POST(webhookRequest(storyPayload()));
		expect(response.status).toBe(200);
		expect(listStories).toHaveBeenCalledTimes(2);
		expect(listStories.mock.calls[1][0].query.page).toBe(2);
		expect(revalidatedTags()).toHaveLength(102);
		expect(revalidatedTags()).toContain('story-5000');
	});

	it('revalidates a story once even when it references itself or repeats', async () => {
		referencedBy(111, 222, 222);
		await POST(webhookRequest(storyPayload()));
		expect(revalidatedTags().sort()).toEqual(['story-111', 'story-222']);
	});

	it('still revalidates the story and answers 502 when the Management API fails', async () => {
		listStories.mockRejectedValueOnce(new Error('rate limited'));
		const response = await POST(webhookRequest(storyPayload()));
		expect(response.status).toBe(502);
		expect(revalidatedTags()).toEqual(['story-111']);
	});

	it('answers 502 when a later page fails, after revalidating what it has', async () => {
		const fullPage = Array.from({ length: 100 }, (_story, index) => ({
			id: 1000 + index,
		}));
		listStories
			.mockResolvedValueOnce({ data: { stories: fullPage } })
			.mockRejectedValueOnce(new Error('boom'));
		const response = await POST(webhookRequest(storyPayload()));
		expect(response.status).toBe(502);
		expect(revalidatedTags()).toContain('story-111');
	});

	it('revalidates the story and answers 502 when the token is not configured', async () => {
		vi.stubEnv('STORYBLOK_MANAGEMENT_TOKEN', '');
		const response = await POST(webhookRequest(storyPayload()));
		expect(response.status).toBe(502);
		expect(revalidatedTags()).toEqual(['story-111']);
		expect(listStories).not.toHaveBeenCalled();
	});
});

describe('other events', () => {
	it.each(['created', 'workflow_changed', 'entries_updated'])(
		'answers 200 and revalidates nothing for %s',
		async (action) => {
			const response = await POST(webhookRequest(storyPayload({ action })));
			expect(response.status).toBe(200);
			expect(revalidateTag).not.toHaveBeenCalled();
			expect(listStories).not.toHaveBeenCalled();
		},
	);

	it('answers 200 to a signed datasource event without story fields', async () => {
		const response = await POST(
			webhookRequest({
				action: 'entries_updated',
				space_id: 12345,
				datasource_id: 7,
			}),
		);
		expect(response.status).toBe(200);
		expect(revalidateTag).not.toHaveBeenCalled();
	});
});

describe('malformed signed payloads', () => {
	it('answers 400 for a body that is not JSON', async () => {
		const response = await POST(webhookRequest(null, { body: 'not json' }));
		expect(response.status).toBe(400);
		expect(revalidateTag).not.toHaveBeenCalled();
	});

	it('answers 400 for a story event without a story id or UUID', async () => {
		const response = await POST(
			webhookRequest(storyPayload({ story_id: undefined })),
		);
		expect(response.status).toBe(400);
		expect(revalidateTag).not.toHaveBeenCalled();
	});
});
