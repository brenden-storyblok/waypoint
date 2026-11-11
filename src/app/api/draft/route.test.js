import { createHash } from 'node:crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const enable = vi.fn();
const draftMode = vi.fn();
vi.mock('next/headers', () => ({ draftMode }));

const { GET } = await import('./route');

const SPACE_ID = '12345';
const PREVIEW_TOKEN = 'test-preview-token';
const TIMESTAMP = '1700000000';

const tokenFor = (spaceId, previewToken, timestamp) =>
	createHash('sha1')
		.update(`${spaceId}:${previewToken}:${timestamp}`)
		.digest('hex');

// The request the proxy hands the route: the Visual Editor's params, plus the
// path the editor asked for.
const requestWith = (storyblokParams, path = '/de/destinations/lisbon') => {
	const url = new URL('http://localhost:3000/api/draft');
	for (const [name, value] of Object.entries(storyblokParams)) {
		url.searchParams.set(`_storyblok_tk[${name}]`, value);
	}
	url.searchParams.set('_storyblok', '98765');
	url.searchParams.set('_storyblok_c', 'page');
	url.searchParams.set('_storyblok_lang', 'de');
	url.searchParams.set('_draft_path', path);
	return new Request(url);
};

const validParams = {
	space_id: SPACE_ID,
	timestamp: TIMESTAMP,
	token: tokenFor(SPACE_ID, PREVIEW_TOKEN, TIMESTAMP),
};

beforeEach(() => {
	enable.mockReset();
	draftMode.mockResolvedValue({ enable });
	vi.stubEnv('STORYBLOK_SPACE_ID', SPACE_ID);
	vi.stubEnv('STORYBLOK_DELIVERY_API_TOKEN', PREVIEW_TOKEN);
});

describe('the draft route', () => {
	it('enables Draft Mode and redirects to the requested page for a valid token', async () => {
		const response = await GET(requestWith(validParams));
		expect(enable).toHaveBeenCalledOnce();
		expect(response.status).toBe(307);
		const target = new URL(response.headers.get('location'));
		expect(target.origin).toBe('http://localhost:3000');
		expect(target.pathname).toBe('/de/destinations/lisbon');
	});

	it('keeps the Visual Editor params the bridge needs on the redirect', async () => {
		const response = await GET(requestWith(validParams));
		const { searchParams } = new URL(response.headers.get('location'));
		expect(searchParams.get('_storyblok')).toBe('98765');
		expect(searchParams.get('_storyblok_c')).toBe('page');
		expect(searchParams.get('_storyblok_lang')).toBe('de');
		expect(searchParams.has('_draft_path')).toBe(false);
	});

	it('drops every _storyblok_tk param, so the redirect cannot loop back', async () => {
		const response = await GET(requestWith(validParams));
		const { searchParams } = new URL(response.headers.get('location'));
		expect(
			[...searchParams.keys()].filter((name) =>
				name.startsWith('_storyblok_tk'),
			),
		).toEqual([]);
	});

	it('answers 401 and stays out of Draft Mode for a token hashed with another preview token', async () => {
		const response = await GET(
			requestWith({
				...validParams,
				token: tokenFor(SPACE_ID, 'another-preview-token', TIMESTAMP),
			}),
		);
		expect(response.status).toBe(401);
		expect(enable).not.toHaveBeenCalled();
	});

	it('answers 401 and stays out of Draft Mode for another space', async () => {
		const response = await GET(
			requestWith({
				space_id: '99999',
				timestamp: TIMESTAMP,
				token: tokenFor('99999', PREVIEW_TOKEN, TIMESTAMP),
			}),
		);
		expect(response.status).toBe(401);
		expect(enable).not.toHaveBeenCalled();
	});

	it('answers 401 and stays out of Draft Mode when the token is not a hash at all', async () => {
		const response = await GET(requestWith({ ...validParams, token: 'abc' }));
		expect(response.status).toBe(401);
		expect(enable).not.toHaveBeenCalled();
	});

	it.each(['space_id', 'timestamp', 'token'])(
		'answers 401 and stays out of Draft Mode without %s',
		async (missing) => {
			const { [missing]: _left, ...params } = validParams;
			const response = await GET(requestWith(params));
			expect(response.status).toBe(401);
			expect(enable).not.toHaveBeenCalled();
		},
	);

	it('answers 401 and stays out of Draft Mode without any params', async () => {
		const response = await GET(new Request('http://localhost:3000/api/draft'));
		expect(response.status).toBe(401);
		expect(enable).not.toHaveBeenCalled();
	});

	it('answers 401 when the space ID is not configured', async () => {
		vi.stubEnv('STORYBLOK_SPACE_ID', '');
		const response = await GET(requestWith({ ...validParams, space_id: '' }));
		expect(response.status).toBe(401);
		expect(enable).not.toHaveBeenCalled();
	});

	it.each(['https://evil.example/', '//evil.example/', '/\\evil.example'])(
		'never redirects off the site (%s)',
		async (path) => {
			const response = await GET(requestWith(validParams, path));
			expect(enable).toHaveBeenCalled();
			expect(new URL(response.headers.get('location')).origin).toBe(
				'http://localhost:3000',
			);
		},
	);
});
