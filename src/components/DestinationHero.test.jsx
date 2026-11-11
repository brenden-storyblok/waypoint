import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { firstImage } from '@/test/firstImage';
import { imageBytes, imageResponse } from '@/test/imageResponse';
import { stubFetch } from '@/test/stubFetch';
import { spacesMeResponse } from '@/test/spacesMe';

const getAll = vi.fn();
const get = vi.fn();
vi.mock('@/lib/storyblok', () => ({
	getStoryblokApi: () => ({ getAll, get }),
}));

const lang = vi.fn();
vi.mock('next/root-params', () => ({ lang }));

const { default: DestinationHero } =
	await import('@/components/DestinationHero');

// The countries datasource as the Delivery API serves it.
const countryEntries = [
	{ value: 'portugal', name: 'Portugal', dimension_value: 'Portugal DE' },
];

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

beforeEach(() => {
	lang.mockResolvedValue('en');
	get.mockResolvedValue(spacesMeResponse);
	getAll.mockReset();
	getAll.mockImplementation(async (path, query) =>
		path === 'cdn/datasource_entries' && query.datasource === 'countries'
			? countryEntries.map((entry) => ({
					...entry,
					dimension_value: query.dimension ? entry.dimension_value : null,
				}))
			: [],
	);
});

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
			'https://a.storyblok.com/f/1/lisbon.jpg/m/640x0/filters:quality(85) 640w',
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

	it('shows the region and the English Country name above the name', async () => {
		stubFetch(imageResponse());
		const html = await renderHero(lisbon);
		expect(html).toContain('>Europe · Portugal</div>');
	});

	it('shows the German Country label in German', async () => {
		stubFetch(imageResponse());
		lang.mockResolvedValue('de');
		const html = await renderHero(lisbon);
		expect(html).toContain('>Europe · Portugal DE</div>');
		expect(getAll.mock.calls[0][1]).toMatchObject({
			datasource: 'countries',
			dimension: 'de',
		});
	});

	it('capitalises the stored key when the countries datasource lacks it', async () => {
		stubFetch(imageResponse());
		getAll.mockResolvedValue([]);
		const html = await renderHero({ ...lisbon, country: 'norway' });
		expect(html).toContain('>Europe · Norway</div>');
	});

	it('renders nothing without a destination', async () => {
		expect(await renderHero(null)).toBe('');
	});
});
