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
			<DestinationCard destination={lisbon} href="/destinations/lisbon" />,
		);
		expect(html).toMatch(/^<a [^>]*href="\/destinations\/lisbon">/);
		expect(html).toMatch(/<\/a>$/);
		expect(html).toMatch(
			/<img [^>]*src="https:\/\/a.storyblok.com\/f\/1\/lisbon.jpg\/m\/800x1000\/smart\/filters:format\(webp\)" alt="Trams on a hill" loading="lazy"\/>/,
		);
		expect(html).toContain('© Jane Doe</small>');
		expect(html).toMatch(/<h3 [^>]*>Lisbon<\/h3>/);
		expect(html).toMatch(/<span [^>]*>Portugal<\/span>/);
		expect(html).toContain('Explore Lisbon →</span>');
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
