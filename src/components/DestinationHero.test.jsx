import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import DestinationHero from '@/components/DestinationHero';
import { firstImage } from '@/test/firstImage';

const lisbon = {
	name: 'Lisbon',
	region: 'Europe',
	country: 'portugal',
	summary: 'Trams and tiles',
	hero_image: {
		filename: 'https://a.storyblok.com/f/1/lisbon.jpg',
		alt: 'Trams on a hill',
		copyright: 'Jane Doe',
	},
};

const heroBlok = { _uid: 'destination-hero-uid' };

describe('DestinationHero', () => {
	it('renders its full-width image eagerly with high fetch priority', () => {
		const html = renderToStaticMarkup(
			<DestinationHero blok={heroBlok} destination={lisbon} />,
		);
		const image = firstImage(html);
		expect(image).toContain('alt="Trams on a hill"');
		expect(image).toContain('loading="eager"');
		expect(image).toContain('fetchPriority="high"');
		expect(image).toContain('sizes="100vw"');
		expect(image).toContain(
			'https://a.storyblok.com/f/1/lisbon.jpg/m/640x0/filters:quality(75) 640w',
		);
		expect(image).not.toContain('/smart');
		expect(html).toContain('© Jane Doe</small>');
	});

	it('renders no image and no credit when the Destination has no hero image', () => {
		const html = renderToStaticMarkup(
			<DestinationHero
				blok={heroBlok}
				destination={{ ...lisbon, hero_image: null }}
			/>,
		);
		expect(html).not.toContain('<img');
		expect(html).not.toContain('<small');
		expect(html).toContain('Lisbon</h1>');
	});
});
