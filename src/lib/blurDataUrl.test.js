import { afterEach, describe, expect, it, vi } from 'vitest';
import { blurDataUrl } from '@/lib/blurDataUrl';

const filename = 'https://a.storyblok.com/f/1/photo.jpg';
const asset = (overrides = {}) => ({ filename, focus: '', ...overrides });

const stubFetch = (response) => {
	const fetchStub = vi.fn().mockResolvedValue(response);
	vi.stubGlobal('fetch', fetchStub);
	return fetchStub;
};
const imageResponse = (contentType = 'image/jpeg') =>
	new Response(Buffer.from('tiny'), {
		headers: { 'content-type': contentType },
	});

afterEach(() => vi.unstubAllGlobals());

describe('blurDataUrl', () => {
	it('returns a base64 data URI from a 16px-wide Image Service URL', async () => {
		const fetchStub = stubFetch(imageResponse());
		const result = await blurDataUrl(asset());
		expect(result).toBe(
			`data:image/jpeg;base64,${Buffer.from('tiny').toString('base64')}`,
		);
		expect(fetchStub.mock.calls[0][0]).toBe(
			`${filename}/m/16x0/filters:quality(75)`,
		);
	});

	it('requests focal() for a crop with a Focus Point', async () => {
		const fetchStub = stubFetch(imageResponse());
		await blurDataUrl(asset({ focus: '400x225:401x226' }), { crop: '4:5' });
		expect(fetchStub.mock.calls[0][0]).toBe(
			`${filename}/m/16x20/filters:focal(400x225:401x226):quality(75)`,
		);
	});

	it('requests /smart for a crop without a Focus Point', async () => {
		const fetchStub = stubFetch(imageResponse());
		await blurDataUrl(asset(), { crop: '4:5' });
		expect(fetchStub.mock.calls[0][0]).toBe(
			`${filename}/m/16x20/smart/filters:quality(75)`,
		);
	});

	it('caches the fetch with a revalidate window and a timeout signal', async () => {
		const fetchStub = stubFetch(imageResponse());
		await blurDataUrl(asset());
		const options = fetchStub.mock.calls[0][1];
		expect(options.next.revalidate).toBeGreaterThan(0);
		expect(options.signal).toBeInstanceOf(AbortSignal);
	});

	it.each([
		['an SVG', asset({ filename: 'https://a.storyblok.com/f/1/logo.svg' })],
		['a GIF', asset({ filename: 'https://a.storyblok.com/f/1/anim.gif' })],
		['a missing filename', asset({ filename: '' })],
		['a missing asset', null],
	])('returns undefined without fetching for %s', async (_label, input) => {
		const fetchStub = stubFetch(imageResponse());
		expect(await blurDataUrl(input)).toBeUndefined();
		expect(fetchStub).not.toHaveBeenCalled();
	});

	it('returns undefined when the fetch rejects', async () => {
		vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
		expect(await blurDataUrl(asset())).toBeUndefined();
	});

	it('returns undefined when the response is not ok', async () => {
		stubFetch(new Response('nope', { status: 404 }));
		expect(await blurDataUrl(asset())).toBeUndefined();
	});
});
