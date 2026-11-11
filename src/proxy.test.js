import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { proxy } from '@/proxy';

const requestTo = (path, { cookie } = {}) =>
	new NextRequest(`http://localhost:3000${path}`, {
		headers: cookie ? { cookie } : {},
	});

const rewrittenTo = (response) =>
	new URL(response.headers.get('x-middleware-rewrite'));

// The page the proxy tells the draft route to return to, sent as a request header.
const draftPathOf = (response) =>
	response.headers.get('x-middleware-request-x-draft-path');

const TOKEN_PARAMS =
	'_storyblok=98765&_storyblok_tk[space_id]=12345&_storyblok_tk[timestamp]=1700000000&_storyblok_tk[token]=abc';

describe('proxy', () => {
	describe('Visual Editor preview requests', () => {
		it('diverts a request carrying _storyblok_tk params to the draft route', () => {
			const response = proxy(
				requestTo(`/de/destinations/lisbon?${TOKEN_PARAMS}`),
			);
			expect(rewrittenTo(response).pathname).toBe('/api/draft');
			// A rewrite drops query params the proxy adds, so the path travels as a
			// request header.
			expect(draftPathOf(response)).toBe('/de/destinations/lisbon');
		});

		it('hands the draft route the Visual Editor params untouched', () => {
			const response = proxy(requestTo(`/?${TOKEN_PARAMS}`));
			const target = rewrittenTo(response);
			expect(target.searchParams.get('_storyblok_tk[token]')).toBe('abc');
			expect(target.searchParams.get('_storyblok')).toBe('98765');
			expect(draftPathOf(response)).toBe('/');
		});

		it('diverts an unprefixed English path too', () => {
			const response = proxy(requestTo(`/about?${TOKEN_PARAMS}`));
			expect(rewrittenTo(response).pathname).toBe('/api/draft');
			expect(draftPathOf(response)).toBe('/about');
		});

		it('diverts even when a Draft Mode cookie is present, since it may be stale', () => {
			const target = rewrittenTo(
				proxy(
					requestTo(`/de/about?${TOKEN_PARAMS}`, {
						cookie: '__prerender_bypass=stale-after-deploy',
					}),
				),
			);
			expect(target.pathname).toBe('/api/draft');
		});

		it('does not divert the redirected request, which carries no token params', () => {
			const response = proxy(
				requestTo('/de/about?_storyblok=98765&_storyblok_c=page', {
					cookie: '__prerender_bypass=abc123',
				}),
			);
			expect(response.headers.get('x-middleware-rewrite')).toBeNull();
			expect(response.headers.get('x-middleware-next')).toBe('1');
		});
	});

	describe('other requests', () => {
		it('rewrites an unprefixed path to English', () => {
			expect(rewrittenTo(proxy(requestTo('/about'))).pathname).toBe(
				'/en/about',
			);
		});

		it('redirects a visible /en path to the unprefixed one', () => {
			const response = proxy(requestTo('/en/about'));
			expect(response.status).toBe(308);
			expect(new URL(response.headers.get('location')).pathname).toBe('/about');
		});

		it('passes a prefixed path through', () => {
			expect(
				proxy(requestTo('/de/about')).headers.get('x-middleware-next'),
			).toBe('1');
		});
	});

	describe('API routes', () => {
		it('passes a POST to the revalidate webhook through, unrewritten', () => {
			const response = proxy(requestTo('/api/revalidate'));
			expect(response.headers.get('x-middleware-next')).toBe('1');
			expect(response.headers.get('x-middleware-rewrite')).toBeNull();
		});

		it('passes the draft route through when called directly', () => {
			const response = proxy(requestTo('/api/draft'));
			expect(response.headers.get('x-middleware-next')).toBe('1');
		});

		it('still rewrites a page whose path only starts like api', () => {
			const target = rewrittenTo(proxy(requestTo('/apiary')));
			expect(target.pathname).toBe('/en/apiary');
		});
	});
});
