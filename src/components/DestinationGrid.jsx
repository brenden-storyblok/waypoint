import { Suspense } from 'react';
import DestinationCard from './DestinationCard';
import DestinationCarousel from './DestinationCarousel';
import DestinationSearch from './DestinationSearch';
import DestinationSearchView from './DestinationSearchView';
import { storyblokEditable } from '@storyblok/react/rsc';
import { getStoryblokApi } from '@/lib/storyblok';
import { storyHref } from '@/lib/links';
import {
	clearChoicesHref,
	parseChoices,
	placesLabel,
	searchDestinations,
} from '@/lib/destinationSearch';

async function findPages(uuids) {
	const hrefs = {};
	if (!uuids.length) return hrefs;
	try {
		const { data } = await getStoryblokApi().get('cdn/stories', {
			version: 'draft',
			content_type: 'destination_page',
			filter_query: { destination: { in: uuids.join(',') } },
			per_page: 100,
		});
		for (const page of data?.stories || []) {
			const id = page.content?.destination;
			if (id) hrefs[id] = storyHref(page);
		}
	} catch (error) {
		console.error('DestinationGrid: page lookup failed', error);
	}
	return hrefs;
}

// Every story of content type `destination` whose Country is any of
// `countries` and that carries any of `attributes`. An empty setting
// filters nothing.
export async function loadAllDestinations({ countries = [], attributes = [] }) {
	const filterQuery = {};
	if (countries.length) filterQuery.country = { in: countries.join(',') };
	if (attributes.length) {
		filterQuery.attributes = { any_in_array: attributes.join(',') };
	}
	try {
		return await getStoryblokApi().getAll(
			'cdn/stories',
			{
				version: 'draft',
				content_type: 'destination',
				...(Object.keys(filterQuery).length && { filter_query: filterQuery }),
			},
			'stories',
		);
	} catch (error) {
		console.error('DestinationGrid: destination lookup failed', error);
		return [];
	}
}

// A Destination story as the record the destination search module reads.
const toRecord = (story) => ({
	uuid: story.uuid,
	name: story.content?.name || story.name,
	country: story.content?.country || '',
	attributes: story.content?.attributes || [],
});

// Labels from a datasource, in datasource order: { value: label }.
async function loadLabels(datasource) {
	try {
		const entries = await getStoryblokApi().getAll(
			'cdn/datasource_entries',
			{ datasource },
			'datasource_entries',
		);
		return Object.fromEntries(
			entries.map((entry) => [entry.value, entry.name]),
		);
	} catch (error) {
		console.error(`DestinationGrid: ${datasource} labels failed`, error);
		return {};
	}
}

// The Destination stories the grid's Pool is filtered from: the picked
// Destinations in the editor order when the editor picked any, otherwise
// every Destination in the grid's Countries and Destination Attributes.
// Picks are uuid strings, or story objects once resolved; a pick that did not
// resolve is left out, so picks that all fail to resolve load nothing.
export async function loadDestinations(blok) {
	const picks = (blok.destinations || []).filter(Boolean);
	if (picks.length) {
		return picks.filter((pick) => typeof pick === 'object');
	}
	return loadAllDestinations({
		countries: blok.countries || [],
		attributes: blok.attributes || [],
	});
}

const DestinationGrid = async ({ blok, searchParams }) => {
	const stories = await loadDestinations(blok);
	const storyByUuid = new Map(stories.map((story) => [story.uuid, story]));

	// With search off the grid ignores the URL and shows the whole Pool.
	const search = Boolean(blok.search_enabled);
	const labels = search
		? {
				countries: await loadLabels('countries'),
				attributes: await loadLabels('destination-attributes'),
			}
		: {};
	const choices = parseChoices(search ? searchParams : undefined);
	const searchResult = searchDestinations({
		destinations: stories.map(toRecord),
		settings: {
			countries: blok.countries || [],
			attributes: blok.attributes || [],
		},
		choices,
		labels,
	});
	const { pool } = searchResult;
	const destinations = pool.map((record) => storyByUuid.get(record.uuid));
	const hrefs = await findPages(
		destinations.map((destination) => destination.uuid),
	);
	const card = (destination) => (
		<DestinationCard
			key={destination.uuid}
			destination={destination}
			href={hrefs[destination.uuid]}
		/>
	);

	const section = (children) => (
		<section {...storyblokEditable(blok)} className="py-18">
			<div className="mx-auto max-w-7xl px-gutter">{children}</div>
		</section>
	);

	// A Carousel always shows the whole Pool, so search wins over it.
	if (!search && blok.carousel) {
		return section(
			<DestinationCarousel
				headline={blok.headline}
				placesLabel={
					destinations.length > 0 ? placesLabel(searchResult) : undefined
				}
			>
				{destinations.map(card)}
			</DestinationCarousel>,
		);
	}

	if (!search) {
		return section(
			<>
				<div className="mb-8 flex flex-wrap items-end justify-between gap-4">
					{blok.headline && (
						<h2 className="font-display text-display leading-[1.05] font-extrabold tracking-[-0.01em] text-balance">
							{blok.headline}
						</h2>
					)}
					{destinations.length > 0 && (
						<span className="font-mono text-xs text-slate-500 dark:text-slate-300">
							{placesLabel(searchResult)}
						</span>
					)}
				</div>
				<div className="grid grid-cols-1 gap-x-6 gap-y-7 sm:grid-cols-2 md:grid-cols-3">
					{destinations.map(card)}
				</div>
			</>,
		);
	}

	const cards = Object.fromEntries(
		destinations.map((destination) => [destination.uuid, card(destination)]),
	);
	const texts = {
		placeholder: blok.search_placeholder,
		countryLabel: blok.country_label,
		attributesLabel: blok.attributes_label,
		emptyMessage: blok.empty_message,
		clearLabel: blok.clear_label,
		clearGroupLabel: blok.clear_group_label || 'Clear',
		doneLabel: blok.done_label || 'Done',
	};
	// The fallback is the same grid, filtered on the server, so a shared
	// link never flashes the full Pool.
	const fallback = (
		<DestinationSearchView
			headline={blok.headline}
			result={searchResult}
			cards={cards}
			texts={texts}
			choices={choices}
			clearHref={clearChoicesHref(searchParams)}
		/>
	);
	return section(
		<Suspense fallback={fallback}>
			<DestinationSearch
				headline={blok.headline}
				pool={pool}
				labels={labels}
				cards={cards}
				texts={texts}
			/>
		</Suspense>,
	);
};

export default DestinationGrid;
