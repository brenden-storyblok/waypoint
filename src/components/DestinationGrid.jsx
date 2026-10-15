import './DestinationGrid.css';
import { Suspense } from 'react';
import DestinationCard from './DestinationCard';
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

const DestinationGrid = async ({ blok, searchParams }) => {
	// The editor's picks: uuid strings, or story objects once resolved.
	const picks = blok.destinations || [];
	const picked = picks
		.map((pick) => (pick && typeof pick === 'object' ? pick.uuid : pick))
		.filter(Boolean);
	const resolved = picks.filter((pick) => pick && typeof pick === 'object');
	const stories = picked.length
		? resolved
		: await loadAllDestinations({
				countries: blok.countries || [],
				attributes: blok.attributes || [],
			});
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
			picked,
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
		<section
			{...storyblokEditable(blok)}
			className="wp-section destination-grid"
		>
			<div className="wp-wrap">{children}</div>
		</section>
	);

	if (!search) {
		return section(
			<>
				<div className="destination-grid__head">
					{blok.headline && (
						<h2 className="wp-section-title">{blok.headline}</h2>
					)}
					{destinations.length > 0 && (
						<span className="destination-grid__count">
							{placesLabel(searchResult)}
						</span>
					)}
				</div>
				<div className="destination-grid__cards">{destinations.map(card)}</div>
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
