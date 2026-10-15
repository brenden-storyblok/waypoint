import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import DestinationCard from '@/components/DestinationCard';

const lisbon = {
	uuid: 'lisbon-uuid',
	name: 'Lisbon story',
	content: {
		name: 'Lisbon',
		country: 'portugal',
		hero_image: {
			filename: 'https://a.storyblok.com/f/1/lisbon.jpg',
			alt: 'Trams on a hill',
			copyright: 'Jane Doe',
		},
	},
};

describe('DestinationCard', () => {
	it('links a Destination with a Destination Page to that page', () => {
		const html = renderToStaticMarkup(
			<DestinationCard destination={lisbon} href="/destinations/lisbon" />
		);
		expect(html).toBe(
			'<a class="destination-grid__card" href="/destinations/lisbon">' +
				'<div class="destination-grid__media">' +
				'<img class="wp-img" src="https://a.storyblok.com/f/1/lisbon.jpg/m/800x1000/smart/filters:format(webp)" alt="Trams on a hill" loading="lazy"/>' +
				'<small class="image-credit">© Jane Doe</small>' +
				'</div>' +
				'<div class="destination-grid__meta">' +
				'<h3 class="destination-grid__name">Lisbon</h3>' +
				'<span class="destination-grid__country">Portugal</span>' +
				'</div>' +
				'<span class="destination-grid__go">Explore Lisbon →</span>' +
				'</a>'
		);
	});

	it('renders an unlinked card with no image when a Destination has neither', () => {
		const html = renderToStaticMarkup(
			<DestinationCard destination={{ uuid: 'x', name: 'Oslo', content: {} }} />
		);
		expect(html).toBe(
			'<div class="destination-grid__card">' +
				'<div class="destination-grid__media"></div>' +
				'<div class="destination-grid__meta">' +
				'<h3 class="destination-grid__name">Oslo</h3>' +
				'</div>' +
				'</div>'
		);
	});
});
