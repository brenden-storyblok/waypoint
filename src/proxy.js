import { NextResponse } from 'next/server';
import { parsePath, DEFAULT_LANGUAGE } from '@/lib/language';

/**
 * English keeps its unprefixed URLs: they are rewritten to /en/... inside the
 * app, and a visible /en/... address redirects back to the unprefixed one.
 * The Language comes from the path alone, never from Accept-Language.
 */
export function proxy(request) {
	const { pathname } = request.nextUrl;
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
