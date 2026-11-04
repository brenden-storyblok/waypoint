import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import DestinationHero from '@/components/DestinationHero';
import { firstImage } from '@/test/firstImage';
import { imageBytes, imageResponse } from '@/test/imageResponse';
import { stubFetch } from '@/test/stubFetch';

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

const renderHero = async (destination) =>
	renderToStaticMarkup(await DestinationHero({ blok: heroBlok, destination }));

afterEach(() => vi.unstubAllGlobals());

describe('DestinationHero', () => {
	it('renders its full-width image eagerly with high fetch priority', async () => {
		stubFetch(imageResponse());
		const html = await renderHero(lisbon);
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

	it('shows a blur placeholder fetched from the Image Service', async () => {
		const fetchStub = stubFetch(imageResponse());
		const image = firstImage(await renderHero(lisbon));
		expect(fetchStub.mock.calls[0][0]).toBe(
			'https://a.storyblok.com/f/1/lisbon.jpg/m/16x0/filters:quality(75)',
		);
		expect(image).toContain(
			`data:image/jpeg;base64,${imageBytes.toString('base64')}`,
		);
	});

	it('renders the image without a placeholder when the fetch fails', async () => {
		vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
		const image = firstImage(await renderHero(lisbon));
		expect(image).not.toContain('background-image');
		expect(image).toContain('alt="Trams on a hill"');
	});

	it('renders no image and no credit when the Destination has no hero image', async () => {
		const fetchStub = stubFetch(imageResponse());
		const html = await renderHero({ ...lisbon, hero_image: null });
		expect(html).not.toContain('<img');
		expect(html).not.toContain('<small');
		expect(html).toContain('Lisbon</h1>');
		expect(fetchStub).not.toHaveBeenCalled();
	});

	it('renders nothing without a destination', async () => {
		expect(await renderHero(null)).toBe('');
	});
});
