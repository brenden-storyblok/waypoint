import { createHash } from 'node:crypto';
import { draftMode } from 'next/headers';
import { NextResponse } from 'next/server';
import { DRAFT_PATH_HEADER, PREVIEW_TOKEN_PREFIX } from '@/lib/draftRoute';
import { safeEqual } from '@/lib/safeEqual';

const unauthorized = () => new NextResponse('Unauthorized', { status: 401 });

/**
 * Whether the Visual Editor's `_storyblok_tk` params prove a request comes from
 * this space's editor: the space ID matches, and the token is the SHA-1 of
 * "<space_id>:<preview token>:<timestamp>". The timestamp's age is not checked.
 */
function isValidPreviewRequest(searchParams) {
	const spaceId = process.env.STORYBLOK_SPACE_ID;
	const previewToken = process.env.STORYBLOK_DELIVERY_API_TOKEN;
	const requestSpaceId = searchParams.get('_storyblok_tk[space_id]');
	const timestamp = searchParams.get('_storyblok_tk[timestamp]');
	const token = searchParams.get('_storyblok_tk[token]');
	if (!spaceId || !previewToken || !requestSpaceId || !timestamp || !token) {
		return false;
	}
	if (!safeEqual(requestSpaceId, spaceId)) return false;
	const expected = createHash('sha1')
		.update(`${requestSpaceId}:${previewToken}:${timestamp}`)
		.digest('hex');
	return safeEqual(token, expected);
}

// The requested page on this site, with the Visual Editor's other params kept
// (_storyblok, _storyblok_c, _storyblok_lang, ...: the bridge needs them). The
// signed `_storyblok_tk[...]` params are dropped, so the redirected request does
// not come back through this route. The home page replaces a target on another
// origin, which closes the open redirect.
function redirectTarget(requestUrl, draftPath) {
	const target = new URL(draftPath || '/', requestUrl);
	if (target.origin !== requestUrl.origin)
		target.href = new URL('/', requestUrl).href;
	target.search = '';
	for (const [name, value] of requestUrl.searchParams) {
		if (!name.startsWith(PREVIEW_TOKEN_PREFIX)) {
			target.searchParams.append(name, value);
		}
	}
	return target;
}

/**
 * Turns on Draft Mode for a Visual Editor preview request and sends the editor
 * back to the page they asked for, without the token params. Each fresh
 * Visual Editor load carries them again and so renews Draft Mode.
 */
export async function GET(request) {
	const requestUrl = new URL(request.url);
	if (!isValidPreviewRequest(requestUrl.searchParams)) return unauthorized();
	(await draftMode()).enable();
	return NextResponse.redirect(
		redirectTarget(requestUrl, request.headers.get(DRAFT_PATH_HEADER)),
		307,
	);
}
