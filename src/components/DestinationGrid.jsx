import { Suspense } from 'react';
import DestinationCard from './DestinationCard';
import DestinationCarousel from './DestinationCarousel';
import DestinationSearch from './DestinationSearch';
import DestinationSearchView from './DestinationSearchView';
import { storyblokEditable } from '@storyblok/react/rsc';
import { getDestinationPages, getDestinations } from '@/lib/content';
import { countryName } from '@/lib/countryName';
import { getLabel, loadLabels } from '@/lib/labels';
import { lang } from 'next/root-params';
import { storyHref } from '@/lib/language';
import {
	clearChoicesHref,
	parseChoices,
	placesLabel,
	searchDestinations,
} from '@/lib/destinationSearch';

async function findPages(uuids) {
	const hrefs = {};
	if (!uuids.length) return hrefs;
	const language = await lang();
	try {
		const pages = await getDestinationPages(uuids, language);
		for (const page of pages) {
			const id = page.content?.destination;
			if (id) hrefs[id] = storyHref(page, language);
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
	const language = await lang();
	try {
		return await getDestinations({ countries, attributes }, language);
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

// The searchable grid once the visitor's choices are known. A shared link
// shows the grid filtered on the server until the client search takes
// over, so the full Pool does not flash.
const VisitorChoicesGrid = async ({
	searchParams,
	blok,
	pool,
	destinations,
	labels,
	cards,
	texts,
	settings,
}) => {
	const urlParams = await searchParams;
	const choices = parseChoices(urlParams);
	const searchResult = searchDestinations({
		destinations,
		settings,
		choices,
		labels,
	});
	const filteredFallback = (
		<DestinationSearchView
			headline={blok.headline}
			result={searchResult}
			cards={cards}
			texts={texts}
			choices={choices}
			clearHref={clearChoicesHref(urlParams)}
		/>
	);
	return (
		<Suspense fallback={filteredFallback}>
			<DestinationSearch
				headline={blok.headline}
				pool={pool}
				labels={labels}
				cards={cards}
				texts={texts}
			/>
		</Suspense>
	);
};

const DestinationGrid = async ({ blok, searchParams }) => {
	const language = await lang();
	const stories = await loadDestinations(blok);
	const records = stories.map(toRecord);
	const settings = {
		countries: blok.countries || [],
		attributes: blok.attributes || [],
	};
	const storyByUuid = new Map(stories.map((story) => [story.uuid, story]));

	// With search off the grid ignores the URL and shows the whole Pool.
	const search = Boolean(blok.search_enabled);
	const placesTemplates = {
		one: await getLabel('places-one'),
		other: await getLabel('places-other'),
		filtered: await getLabel('places-filtered'),
	};
	// Cards name their Country in every mode, so the labels load regardless.
	const countryLabels = await loadLabels('countries', language);
	const exploreTemplate = await getLabel('card-explore');
	const labels = search
		? {
				countries: countryLabels,
				attributes: await loadLabels('destination-attributes', language),
			}
		: {};
	const searchResult = searchDestinations({
		destinations: records,
		settings,
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
			countryLabel={countryName(countryLabels, destination.content?.country)}
			exploreTemplate={exploreTemplate}
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
					destinations.length > 0
						? placesLabel(searchResult, placesTemplates)
						: undefined
				}
				label={await getLabel('carousel-label')}
				roleDescription={await getLabel('carousel-roledescription')}
				previousLabel={await getLabel('carousel-previous')}
				nextLabel={await getLabel('carousel-next')}
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
							{placesLabel(searchResult, placesTemplates)}
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
		placeholder: await getLabel('search-placeholder'),
		countryLabel: await getLabel('country-heading'),
		attributesLabel: await getLabel('attributes-heading'),
		emptyMessage: await getLabel('empty-message'),
		clearLabel: await getLabel('clear-all'),
		clearGroupLabel: await getLabel('clear-group'),
		doneLabel: await getLabel('done'),
		selectedTemplate: await getLabel('filter-selected'),
		placesTemplates,
	};
	// Search Text and Filters come from the URL, which the page hands down as
	// a promise. Reading it inside <Suspense> keeps the Pool, labels and cards
	// above out of the per-request work. While it settles, the fallback is the
	// same grid with nothing narrowed.
	const fallback = (
		<DestinationSearchView
			headline={blok.headline}
			result={searchResult}
			cards={cards}
			texts={texts}
			choices={parseChoices()}
			clearHref={clearChoicesHref()}
		/>
	);
	return section(
		<Suspense fallback={fallback}>
			<VisitorChoicesGrid
				searchParams={searchParams}
				blok={blok}
				pool={pool}
				destinations={records}
				settings={settings}
				labels={labels}
				cards={cards}
				texts={texts}
			/>
		</Suspense>,
	);
};

export default DestinationGrid;
