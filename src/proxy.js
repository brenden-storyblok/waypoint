import { NextResponse } from 'next/server';
import { parsePath, DEFAULT_LANGUAGE } from '@/lib/language';
import { DRAFT_PATH_HEADER, hasPreviewParams } from '@/lib/draftRoute';

/**
 * English keeps its unprefixed URLs: they are rewritten to /en/... inside the
 * app, and a visible /en/... address redirects back to the unprefixed one.
 * The Language comes from the path, not from Accept-Language.
 */
export function proxy(request) {
	const { pathname, searchParams } = request.nextUrl;

	// Route handlers under /api answer on their own path: a webhook POST must
	// not be rewritten into the [lang] page. The rewrite below to the draft route
	// skips the proxy, so this branch covers direct calls.
	if (pathname === '/api' || pathname.startsWith('/api/')) {
		return NextResponse.next();
	}

	// A Visual Editor preview request carries `_storyblok_tk` params. The draft
	// route checks them, turns Draft Mode on and redirects without them, so the
	// redirected request is an ordinary one and cannot loop. Cookies play no part:
	// the route renews a stale Draft Mode cookie after a deploy.
	if (hasPreviewParams(searchParams)) {
		const url = request.nextUrl.clone();
		url.pathname = '/api/draft';
		const requestHeaders = new Headers(request.headers);
		requestHeaders.set(DRAFT_PATH_HEADER, pathname);
		return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
	}

	const { language, prefixed } = parsePath(pathname);

	if (prefixed && language === DEFAULT_LANGUAGE) {
		const url = request.nextUrl.clone();
		url.pathname = pathname.slice(`/${DEFAULT_LANGUAGE}`.length) || '/';
		return NextResponse.redirect(url, 308);
	}

	if (!prefixed) {
		const url = request.nextUrl.clone();
		url.pathname = `/${DEFAULT_LANGUAGE}${pathname === '/' ? '' : pathname}`;
		return NextResponse.rewrite(url);
	}

	return NextResponse.next();
}

export const config = {
	// Skip Next internals and static files (anything with an extension).
	matcher: ['/((?!_next|.*\\..*).*)'],
};
