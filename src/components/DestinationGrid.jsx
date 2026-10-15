import './DestinationGrid.css';
import { storyblokEditable } from '@storyblok/react/rsc';
import { getStoryblokApi } from '@/lib/storyblok';
import { storyHref } from '@/lib/links';
import { imageUrl, imageAlt } from '@/lib/images';

const capitalise = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');

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

const DestinationGrid = async ({ blok }) => {
	const destinations = (blok.destinations || []).filter(
		(d) => d && typeof d === 'object'
	);
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
					{destinations.map((d) => {
						const content = d.content || {};
						const name = content.name || d.name;
						const src = imageUrl(content.hero_image, 800, 1000);
						const href = hrefs[d.uuid];
						const body = (
							<>
								<div className="destination-grid__media">
									{src && (
										// eslint-disable-next-line @next/next/no-img-element
										<img
											className="wp-img"
											src={src}
											alt={imageAlt(content.hero_image)}
											loading="lazy"
										/>
									)}
								</div>
								<div className="destination-grid__meta">
									<h3 className="destination-grid__name">{name}</h3>
									{content.country && (
										<span className="destination-grid__country">
											{capitalise(content.country)}
										</span>
									)}
								</div>
								{href && (
									<span className="destination-grid__go">Explore {name} →</span>
								)}
							</>
						);
						return href ? (
							<a key={d.uuid} className="destination-grid__card" href={href}>
								{body}
							</a>
						) : (
							<div key={d.uuid} className="destination-grid__card">
								{body}
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
};

export default DestinationGrid;
