import { cache } from 'react';
import { cacheLife, cacheTag } from 'next/cache';
import { draftMode } from 'next/headers';
import { getStoryblokApi, RESOLVE_RELATIONS } from '@/lib/storyblok';
import { DEFAULT_LANGUAGE, deliveryLanguageParams } from '@/lib/language';
import { storyTag } from '@/lib/storyTag';

/**
 * The content module owns every Delivery API read. Pages, layouts and
 * components call these functions instead of the Storyblok client.
 *
 * Each read has a published and a draft form. Both call one fetcher that takes
 * the content version (`fetchPublishedX`, `fetchDraftX`). The public function
 * reads Draft Mode, which must stay outside every cached function, and hands
 * over to one of the two forms.
 *
 * The published forms are `'use cache'` functions on the `storyblok` cache
 * life profile (`cachedX`). Their arguments form the cache key, so they take
 * serialisable arguments and return plain data. Each fetches the Cache Version
 * inside its own cached function and sends it as `cv`, so a cache entry that
 * regenerates asks the Storyblok CDN for the copy of the current content. The
 * draft forms skip the cache.
 */

// Next serialises an error that crosses a 'use cache' boundary and rebuilds it
// as a plain Error. The class is gone, the message is gone in production, and
// the digest is all that remains. A custom digest made the page answer 500. Next's
// own not-found digest works: Next treats the cached read's error as a 404
// when nobody catches it. The public reads use the digest to recognise a
// missing story after the boundary and throw a StoryNotFoundError.
const STORY_NOT_FOUND_DIGEST = 'NEXT_HTTP_ERROR_FALLBACK;404';

/** The story a read looked for does not exist. */
export class StoryNotFoundError extends Error {
	constructor(description) {
		super(`Story not found: ${description}`);
		this.name = 'StoryNotFoundError';
		this.digest = STORY_NOT_FOUND_DIGEST;
	}
}

/** Whether the error is a StoryNotFoundError, including one that crossed a cache boundary. */
export const isStoryNotFound = (error) =>
	error?.digest === STORY_NOT_FOUND_DIGEST;

const isNotFound = (error) => error?.status === 404;

// Runs the published or the draft form of a read, by the request's Draft Mode.
// `description` names what the read looks for, for a StoryNotFoundError.
async function inCurrentMode(description, publishedRead, draftRead, ...args) {
	const { isEnabled } = await draftMode();
	try {
		return await (isEnabled ? draftRead : publishedRead)(...args);
	} catch (error) {
		// The error left the cached function: restore the page's error class.
		if (isStoryNotFound(error) && !(error instanceof StoryNotFoundError)) {
			throw new StoryNotFoundError(description);
		}
		throw error;
	}
}

/**
 * The space's Cache Version: `space.version` on `cdn/spaces/me`. Nothing
 * stores it, so it is as new as the request that asks.
 *
 * `cache()` dedupes the call inside one render context. Each `'use cache'`
 * function runs in a context of its own, so two cached reads in one render
 * each make the call, and a warm cache entry makes none.
 */
const getCacheVersion = cache(async () => {
	const { data } = await getStoryblokApi().get('cdn/spaces/me');
	return data.space.version;
});

// The Cache Version as the `cv` param of a published read; a draft read has none.
const cvParam = (cacheVersion) => (cacheVersion ? { cv: cacheVersion } : {});

const storyFetcher = (version) => async (fullSlug, language, cacheVersion) => {
	try {
		const { data } = await getStoryblokApi().get(`cdn/stories/${fullSlug}`, {
			version,
			...cvParam(cacheVersion),
			...deliveryLanguageParams(language),
			resolve_relations: RESOLVE_RELATIONS.join(','),
		});
		return data.story;
	} catch (error) {
		if (isNotFound(error)) throw new StoryNotFoundError(fullSlug);
		throw error;
	}
};
const fetchPublishedStory = storyFetcher('published');
const fetchDraftStory = storyFetcher('draft');

// A missing story throws before the function returns, so Next caches nothing.
async function cachedStory(fullSlug, language) {
	'use cache';
	cacheLife('storyblok');
	const story = await fetchPublishedStory(
		fullSlug,
		language,
		await getCacheVersion(),
	);
	cacheTag(storyTag(story.id));
	return story;
}

/** The page story at a full slug in a Language. Throws StoryNotFoundError. */
export const getStory = (fullSlug, language) =>
	inCurrentMode(fullSlug, cachedStory, fetchDraftStory, fullSlug, language);

const globalStoriesFetcher = (version) => async (language, cacheVersion) => {
	const { data } = await getStoryblokApi().get('cdn/stories', {
		version,
		...cvParam(cacheVersion),
		starts_with: 'global/',
		...deliveryLanguageParams(language),
	});
	const byComponent = Object.fromEntries(
		data.stories.map((story) => [story.content?.component, story]),
	);
	const { header, footer } = byComponent;
	if (!header && !footer)
		throw new StoryNotFoundError('global/ header or footer');
	return { header, footer };
};
const fetchPublishedGlobalStories = globalStoriesFetcher('published');
const fetchDraftGlobalStories = globalStoriesFetcher('draft');

// One request and one entry, tagged with the id of each story it holds:
// publishing either story refetches the pair. A global folder with neither
// story throws, so Next caches nothing for it.
async function cachedGlobalStories(language) {
	'use cache';
	cacheLife('storyblok');
	const stories = await fetchPublishedGlobalStories(
		language,
		await getCacheVersion(),
	);
	cacheTag(
		...[stories.header, stories.footer]
			.filter(Boolean)
			.map((story) => storyTag(story.id)),
	);
	return stories;
}

/**
 * The header and footer stories from the global/ folder, in one request.
 * Either can be missing; the read throws StoryNotFoundError when both are.
 */
export const getGlobalStories = (language) =>
	inCurrentMode(
		'global/ header or footer',
		cachedGlobalStories,
		fetchDraftGlobalStories,
		language,
	);

const datasourceFetcher = (version) => (datasource, language, cacheVersion) =>
	getStoryblokApi().getAll(
		'cdn/datasource_entries',
		{
			version,
			...cvParam(cacheVersion),
			datasource,
			...(language !== DEFAULT_LANGUAGE && { dimension: language }),
		},
		'datasource_entries',
	);
const fetchPublishedDatasourceEntries = datasourceFetcher('published');
const fetchDraftDatasourceEntries = datasourceFetcher('draft');

async function cachedDatasourceEntries(datasource, language) {
	'use cache';
	cacheLife('storyblok');
	return fetchPublishedDatasourceEntries(
		datasource,
		language,
		await getCacheVersion(),
	);
}

/** The entries of a datasource, with the Language's dimension for non-default Languages. */
export const getDatasourceEntries = (datasource, language) =>
	inCurrentMode(
		`datasource ${datasource}`,
		cachedDatasourceEntries,
		fetchDraftDatasourceEntries,
		datasource,
		language,
	);

const destinationsFetcher =
	(version) =>
	({ countries, attributes }, language, cacheVersion) => {
		const filterQuery = {};
		if (countries.length) filterQuery.country = { in: countries.join(',') };
		if (attributes.length) {
			filterQuery.attributes = { any_in_array: attributes.join(',') };
		}
		return getStoryblokApi().getAll(
			'cdn/stories',
			{
				version,
				...cvParam(cacheVersion),
				content_type: 'destination',
				...deliveryLanguageParams(language),
				...(Object.keys(filterQuery).length && { filter_query: filterQuery }),
			},
			'stories',
		);
	};
const fetchPublishedDestinations = destinationsFetcher('published');
const fetchDraftDestinations = destinationsFetcher('draft');

// A Pool's Destinations carry no tags: a Pool selected by filter refreshes on
// the cache life, and picked Destinations arrive resolved with the page story.
async function cachedDestinations(filters, language) {
	'use cache';
	cacheLife('storyblok');
	return fetchPublishedDestinations(filters, language, await getCacheVersion());
}

/**
 * Every Destination story in any of the `countries` that carries any of the
 * `attributes`. An empty list filters nothing.
 */
export const getDestinations = (
	{ countries = [], attributes = [] },
	language,
) =>
	inCurrentMode(
		'Destinations',
		cachedDestinations,
		fetchDraftDestinations,
		{ countries, attributes },
		language,
	);

const destinationPagesFetcher =
	(version) => async (uuids, language, cacheVersion) => {
		const { data } = await getStoryblokApi().get('cdn/stories', {
			version,
			...cvParam(cacheVersion),
			content_type: 'destination_page',
			...deliveryLanguageParams(language),
			filter_query: { destination: { in: uuids.join(',') } },
			per_page: 100,
		});
		return data?.stories || [];
	};
const fetchPublishedDestinationPages = destinationPagesFetcher('published');
const fetchDraftDestinationPages = destinationPagesFetcher('draft');

async function cachedDestinationPages(uuids, language) {
	'use cache';
	cacheLife('storyblok');
	return fetchPublishedDestinationPages(
		uuids,
		language,
		await getCacheVersion(),
	);
}

/** The Destination Pages that point at any of the Destination `uuids`. */
export const getDestinationPages = (uuids, language) =>
	inCurrentMode(
		'Destination Pages',
		cachedDestinationPages,
		fetchDraftDestinationPages,
		uuids,
		language,
	);
