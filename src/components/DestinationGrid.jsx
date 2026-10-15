import './DestinationGrid.css';
import DestinationCard from './DestinationCard';
import { storyblokEditable } from '@storyblok/react/rsc';
import { getStoryblokApi } from '@/lib/storyblok';
import { storyHref } from '@/lib/links';
import { searchDestinations } from '@/lib/destinationSearch';

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

// Every story of content type `destination`.
async function loadAllDestinations() {
	try {
		return await getStoryblokApi().getAll(
			'cdn/stories',
			{ version: 'draft', content_type: 'destination' },
			'stories'
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

const DestinationGrid = async ({ blok }) => {
	// The editor's raw picks: uuid strings, or story objects once resolved.
	const raw = blok.destinations || [];
	const picked = raw
		.map((d) => (d && typeof d === 'object' ? d.uuid : d))
		.filter(Boolean);
	const resolved = raw.filter((d) => d && typeof d === 'object');
	const stories = picked.length ? resolved : await loadAllDestinations();
	const storyByUuid = new Map(stories.map((s) => [s.uuid, s]));

	const { pool } = searchDestinations({
		destinations: stories.map(toRecord),
		settings: { picked },
	});
	const destinations = pool.map((d) => storyByUuid.get(d.uuid));
	const hrefs = await findPages(destinations.map((d) => d.uuid));

	return (
		<section {...storyblokEditable(blok)} className="wp-section destination-grid">
			<div className="wp-wrap">
				<div className="destination-grid__head">
					{blok.headline && <h2 className="wp-section-title">{blok.headline}</h2>}
					{destinations.length > 0 && (
						<span className="destination-grid__count">
							{destinations.length} {destinations.length === 1 ? 'place' : 'places'}
						</span>
					)}
				</div>
				<div className="destination-grid__cards">
					{destinations.map((d) => (
						<DestinationCard key={d.uuid} destination={d} href={hrefs[d.uuid]} />
					))}
				</div>
			</div>
		</section>
	);
};

export default DestinationGrid;
