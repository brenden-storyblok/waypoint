import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import Hero from '@/components/Hero';
import { firstImage } from '@/test/firstImage';
import { imageBytes, imageResponse } from '@/test/imageResponse';
import { stubFetch } from '@/test/stubFetch';

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

const renderHero = async (blok) =>
	renderToStaticMarkup(await Hero({ blok }));

afterEach(() => vi.unstubAllGlobals());

describe('Hero', () => {
	it('renders its image eagerly with high fetch priority at Storyblok widths', async () => {
		stubFetch(imageResponse());
		const html = await renderHero(heroBlok(heroImage));
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

	it('shows a blur placeholder fetched from the Image Service', async () => {
		const fetchStub = stubFetch(imageResponse());
		const image = firstImage(await renderHero(heroBlok(heroImage)));
		expect(fetchStub.mock.calls[0][0]).toBe(
			'https://a.storyblok.com/f/1/hero.jpg/m/16x0/filters:quality(75)',
		);
		expect(image).toContain(
			`data:image/jpeg;base64,${imageBytes.toString('base64')}`,
		);
	});

	it('renders the image without a placeholder when the fetch fails', async () => {
		vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
		const image = firstImage(await renderHero(heroBlok(heroImage)));
		expect(image).not.toContain('background-image');
		expect(image).toContain('alt="Trams on a hill"');
	});

	it('renders no image and no credit when the Hero has no image', async () => {
		const fetchStub = stubFetch(imageResponse());
		const html = await renderHero(heroBlok(null));
		expect(html).not.toContain('<img');
		expect(html).not.toContain('<small');
		expect(html).toContain('Find your next city');
		expect(fetchStub).not.toHaveBeenCalled();
	});
});
