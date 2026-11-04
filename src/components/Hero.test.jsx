import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import Hero from '@/components/Hero';
import { firstImage } from '@/test/firstImage';

const heroImage = {
	filename: 'https://a.storyblok.com/f/1/hero.jpg',
	alt: 'Trams on a hill',
	copyright: 'Jane Doe',
};

const heroBlok = (image) => ({
	_uid: 'hero-uid',
	headline: 'Find your next city',
	intro: 'Short intro',
	cta: [],
	image,
});

describe('Hero', () => {
	it('renders its image eagerly with high fetch priority at Storyblok widths', () => {
		const html = renderToStaticMarkup(<Hero blok={heroBlok(heroImage)} />);
		const image = firstImage(html);
		expect(image).toContain('alt="Trams on a hill"');
		expect(image).toContain('loading="eager"');
		expect(image).toContain('fetchPriority="high"');
		expect(image).toContain('sizes="(min-width: 768px) 49vw, 100vw"');
		expect(image).toContain(
			'https://a.storyblok.com/f/1/hero.jpg/m/640x0/filters:quality(75) 640w',
		);
		expect(image).not.toContain('/smart');
		expect(html).toContain('© Jane Doe</small>');
	});

	it('renders no image and no credit when the Hero has no image', () => {
		const html = renderToStaticMarkup(<Hero blok={heroBlok(null)} />);
		expect(html).not.toContain('<img');
		expect(html).not.toContain('<small');
		expect(html).toContain('Find your next city');
	});
});
