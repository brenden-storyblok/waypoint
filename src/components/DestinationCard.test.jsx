import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import DestinationCard from '@/components/DestinationCard';
import { firstImage } from '@/test/firstImage';

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
			<DestinationCard
				destination={lisbon}
				href="/destinations/lisbon"
				countryLabel="Portugal"
				exploreTemplate="Explore {name}"
			/>,
		);
		expect(html).toMatch(/^<a [^>]*href="\/destinations\/lisbon">/);
		expect(html).toMatch(/<\/a>$/);
		const image = firstImage(html);
		expect(image).toContain('alt="Trams on a hill"');
		expect(image).toContain('loading="lazy"');
		expect(image).toContain(
			'https://a.storyblok.com/f/1/lisbon.jpg/m/640x800/smart/filters:quality(75) 640w',
		);
		expect(html).toContain('© Jane Doe</small>');
		expect(html).toMatch(/<h3 [^>]*>Lisbon<\/h3>/);
		expect(html).toMatch(/<span [^>]*>Portugal<\/span>/);
		expect(html).toContain('Explore Lisbon →</span>');
	});

	it('shows the Country label and explore text it is given in German', () => {
		const html = renderToStaticMarkup(
			<DestinationCard
				destination={lisbon}
				href="/de/destinations/lisbon"
				countryLabel="Portugal DE"
				exploreTemplate="{name} entdecken"
			/>,
		);
		expect(html).toMatch(/<span [^>]*>Portugal DE<\/span>/);
		expect(html).toContain('Lisbon entdecken →</span>');
		expect(html).not.toContain('Explore');
	});

	it('renders an unlinked card with no image when a Destination has neither', () => {
		const html = renderToStaticMarkup(
			<DestinationCard
				destination={{ uuid: 'x', name: 'Oslo', content: {} }}
			/>,
		);
		expect(html).toMatch(/^<div /);
		expect(html).not.toContain('<a ');
		expect(html).not.toContain('<img');
		expect(html).not.toContain('<small');
		expect(html).toMatch(/<h3 [^>]*>Oslo<\/h3>/);
		expect(html).not.toContain('Explore');
	});
});
