import { beforeEach, describe, expect, it, vi } from 'vitest';
import { stubFetch } from '@/test/stubFetch';
import { SPACES_ME } from '@/test/spacesMe';

const draftMode = vi.fn();
vi.mock('next/headers', () => ({ draftMode }));

// The 'use cache' directive does nothing under Vitest, so the tests check
// the cache calls each read makes through these mocks.
const cacheLife = vi.fn();
const cacheTag = vi.fn();
vi.mock('next/cache', () => ({ cacheLife, cacheTag }));

const {
	StoryNotFoundError,
	isStoryNotFound,
	getDatasourceEntries,
	getDestinationPages,
	getDestinations,
	getGlobalStories,
	getStory,
} = await import('@/lib/content');

const jsonResponse = (body, { status = 200, headers = {} } = {}) =>
	new Response(JSON.stringify(body), {
		status,
		headers: { 'content-type': 'application/json', ...headers },
	});

const CACHE_VERSION = 1700000001;
const isSpacesMe = (path) => path.endsWith(`/${SPACES_ME}`);

// Every request the Delivery API received, as { path, query }.
let fetchStub;
const requests = () =>
	fetchStub.mock.calls.map(([url]) => {
		const { pathname, searchParams } = new URL(url);
		return { path: pathname, query: Object.fromEntries(searchParams) };
	});
const spacesMeRequests = () =>
	requests().filter(({ path }) => isSpacesMe(path));
// The content requests: everything except the Cache Version lookup.
const contentRequests = () =>
	requests().filter(({ path }) => !isSpacesMe(path));
const sentQueries = () => contentRequests().map(({ query }) => query);
const sentPaths = () => contentRequests().map(({ path }) => path);

// Answers cdn/spaces/me with the Cache Version and everything else with the body.
const serve = (body, options) => {
	fetchStub.mockImplementation(async (url) =>
		isSpacesMe(new URL(url).pathname)
			? jsonResponse({ space: { version: CACHE_VERSION } })
			: jsonResponse(body, options),
	);
};

const draftModeIs = (isEnabled) => draftMode.mockResolvedValue({ isEnabled });

beforeEach(() => {
	vi.clearAllMocks();
	fetchStub = stubFetch();
	draftModeIs(false);
});

// Every read the module owns, each with the response that satisfies it.
const reads = {
	'a story': {
		read: () => getStory('destinations/lisbon', 'en'),
		body: { story: { id: 1, content: {} }, cv: 1 },
	},
	'the global stories': {
		read: () => getGlobalStories('en'),
		body: {
			stories: [
				{ id: 2, content: { component: 'header' } },
				{ id: 3, content: { component: 'footer' } },
			],
			cv: 1,
		},
	},
	'datasource entries': {
		read: () => getDatasourceEntries('ui-labels', 'en'),
		body: { datasource_entries: [], cv: 1 },
	},
	Destinations: {
		read: () => getDestinations({ countries: [], attributes: [] }, 'en'),
		body: { stories: [], cv: 1 },
	},
	'Destination pages': {
		read: () => getDestinationPages(['lisbon'], 'en'),
		body: { stories: [], cv: 1 },
	},
};

describe.each(Object.entries(reads))('reading %s', (_name, { read, body }) => {
	it('asks for published content outside Draft Mode', async () => {
		serve(body);
		await read();
		expect(sentQueries().length).toBeGreaterThan(0);
		for (const query of sentQueries()) expect(query.version).toBe('published');
	});

	it('asks for draft content in Draft Mode', async () => {
		draftModeIs(true);
		serve(body);
		await read();
		expect(sentQueries().length).toBeGreaterThan(0);
		for (const query of sentQueries()) expect(query.version).toBe('draft');
	});
});

describe.each(Object.entries(reads))('caching %s', (_name, { read, body }) => {
	it('sends the Cache Version from the space as cv', async () => {
		serve(body);
		await read();
		expect(spacesMeRequests()).toHaveLength(1);
		for (const query of sentQueries()) {
			expect(query.cv).toBe(String(CACHE_VERSION));
		}
	});

	it('uses the storyblok cache life', async () => {
		serve(body);
		await read();
		expect(cacheLife).toHaveBeenCalledWith('storyblok');
	});

	it('skips the cache in Draft Mode', async () => {
		draftModeIs(true);
		serve(body);
		await read();
		expect(cacheLife).not.toHaveBeenCalled();
		expect(cacheTag).not.toHaveBeenCalled();
		expect(spacesMeRequests()).toHaveLength(0);
		for (const query of sentQueries()) expect(query).not.toHaveProperty('cv');
	});
});

describe('getStory', () => {
	it('tags the cache entry with the story id', async () => {
		serve({ story: { id: 7, content: {} }, cv: 1 });
		await getStory('destinations/lisbon', 'en');
		expect(cacheTag).toHaveBeenCalledTimes(1);
		expect(cacheTag).toHaveBeenCalledWith('story-7');
	});

	it('tags nothing for a missing story', async () => {
		serve({ error: 'Not found' }, { status: 404 });
		await expect(getStory('nowhere', 'en')).rejects.toBeInstanceOf(
			StoryNotFoundError,
		);
		expect(cacheTag).not.toHaveBeenCalled();
	});

	it('returns the story with its relations resolved', async () => {
		const story = { id: 7, full_slug: 'destinations/lisbon', content: {} };
		serve({ story, cv: 1 });
		expect(await getStory('destinations/lisbon', 'en')).toEqual(story);
		expect(sentPaths()[0]).toMatch(/\/cdn\/stories\/destinations\/lisbon$/);
		expect(sentQueries()[0].resolve_relations).toContain(
			'destination_page.destination',
		);
	});

	it('asks for the Language of a non-default route', async () => {
		serve({ story: { id: 7 }, cv: 1 });
		await getStory('destinations/lisbon', 'de');
		expect(sentQueries()[0].language).toBe('de');
	});

	it('throws a StoryNotFoundError when the story is missing', async () => {
		serve({ error: 'Not found' }, { status: 404 });
		await expect(getStory('nowhere', 'en')).rejects.toBeInstanceOf(
			StoryNotFoundError,
		);
	});

	it('lets other failures through unchanged', async () => {
		serve({ error: 'Down' }, { status: 500 });
		await expect(
			getStory('destinations/lisbon', 'en'),
		).rejects.not.toBeInstanceOf(StoryNotFoundError);
	});
});

describe('getGlobalStories', () => {
	it('tags the entry with the header and the footer story ids', async () => {
		serve({
			stories: [
				{ id: 2, content: { component: 'header' } },
				{ id: 3, content: { component: 'footer' } },
			],
			cv: 1,
		});
		await getGlobalStories('en');
		const tags = cacheTag.mock.calls.flat();
		expect(tags.sort()).toEqual(['story-2', 'story-3']);
	});

	it('returns the header and footer found in the global folder', async () => {
		const header = { id: 2, content: { component: 'header' } };
		const footer = { id: 3, content: { component: 'footer' } };
		serve({ stories: [footer, header], cv: 1 });
		expect(await getGlobalStories('en')).toEqual({ header, footer });
		expect(sentQueries()[0].starts_with).toBe('global/');
	});

	it('returns the header alone, tagged with its id, when the footer is missing', async () => {
		const header = { id: 2, content: { component: 'header' } };
		serve({ stories: [header], cv: 1 });
		expect(await getGlobalStories('en')).toEqual({ header });
		expect(cacheTag.mock.calls.flat()).toEqual(['story-2']);
	});

	it('returns the footer alone when the header is missing', async () => {
		const footer = { id: 3, content: { component: 'footer' } };
		serve({ stories: [footer], cv: 1 });
		expect(await getGlobalStories('en')).toEqual({ footer });
		expect(cacheTag.mock.calls.flat()).toEqual(['story-3']);
	});

	it('throws a StoryNotFoundError, and tags nothing, when both are missing', async () => {
		serve({ stories: [], cv: 1 });
		await expect(getGlobalStories('en')).rejects.toBeInstanceOf(
			StoryNotFoundError,
		);
		expect(cacheTag).not.toHaveBeenCalled();
	});
});

describe.each([
	[
		'datasource entries',
		() => getDatasourceEntries('ui-labels', 'en'),
		{ datasource_entries: [] },
	],
	['Destinations', () => getDestinations({}, 'en'), { stories: [] }],
	[
		'Destination pages',
		() => getDestinationPages(['a'], 'en'),
		{ stories: [] },
	],
])('%s', (_name, read, body) => {
	it('get no tags', async () => {
		serve(body);
		await read();
		expect(cacheTag).not.toHaveBeenCalled();
	});
});

describe('getDatasourceEntries', () => {
	it('returns the entries of the datasource in the Language dimension', async () => {
		const entries = [
			{ value: 'done', name: 'Done', dimension_value: 'Fertig' },
		];
		serve({ datasource_entries: entries, cv: 1 });
		expect(await getDatasourceEntries('ui-labels', 'de')).toEqual(entries);
		expect(sentQueries()[0]).toMatchObject({
			datasource: 'ui-labels',
			dimension: 'de',
		});
	});

	it('sends no dimension for English', async () => {
		serve({ datasource_entries: [], cv: 1 });
		await getDatasourceEntries('ui-labels', 'en');
		expect(sentQueries()[0]).not.toHaveProperty('dimension');
	});
});

describe('getDestinations', () => {
	it('filters by Countries and Destination Attributes', async () => {
		serve({ stories: [], cv: 1 });
		await getDestinations(
			{ countries: ['italy', 'greece'], attributes: ['beach'] },
			'en',
		);
		const query = sentQueries()[0];
		expect(query.content_type).toBe('destination');
		expect(query['filter_query[country][in]']).toBe('italy,greece');
		expect(query['filter_query[attributes][any_in_array]']).toBe('beach');
	});

	it('returns every Destination the Delivery API sends', async () => {
		const lisbon = { uuid: 'lisbon', content: {} };
		serve({ stories: [lisbon], cv: 1 });
		expect(
			await getDestinations({ countries: [], attributes: [] }, 'en'),
		).toEqual([lisbon]);
	});
});

describe('getDestinationPages', () => {
	it('returns the Destination pages that point at the Destinations', async () => {
		const page = { full_slug: 'destinations/lisbon', content: {} };
		serve({ stories: [page], cv: 1 });
		expect(await getDestinationPages(['lisbon', 'porto'], 'de')).toEqual([
			page,
		]);
		const query = sentQueries()[0];
		expect(query.content_type).toBe('destination_page');
		expect(query['filter_query[destination][in]']).toBe('lisbon,porto');
		expect(query.language).toBe('de');
	});
});

describe('isStoryNotFound', () => {
	it('recognises a StoryNotFoundError', () => {
		expect(isStoryNotFound(new StoryNotFoundError('nowhere'))).toBe(true);
	});

	// Across a 'use cache' boundary the error arrives as a plain Error that
	// kept only its digest.
	it('recognises the error that crossed a cache boundary by its digest', () => {
		const crossed = Object.assign(new Error('An error occurred'), {
			digest: new StoryNotFoundError('nowhere').digest,
		});
		expect(isStoryNotFound(crossed)).toBe(true);
	});

	it('does not take other errors for a missing story', () => {
		expect(isStoryNotFound(new Error('Story not found: nowhere'))).toBe(false);
		expect(isStoryNotFound(Object.assign(new Error(), { digest: '1' }))).toBe(
			false,
		);
		expect(isStoryNotFound(undefined)).toBe(false);
	});
});
