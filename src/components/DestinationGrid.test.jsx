import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

const getAll = vi.fn();
const get = vi.fn();
vi.mock('@/lib/storyblok', () => ({
	getStoryblokApi: () => ({ getAll, get }),
}));

const {
	default: DestinationGrid,
	loadAllDestinations,
	loadDestinations,
} = await import('@/components/DestinationGrid');

// The query loadAllDestinations sent to the Delivery API.
const sentQuery = () => getAll.mock.calls[0][1];

describe('loadAllDestinations', () => {
	beforeEach(() => {
		getAll.mockReset();
		getAll.mockResolvedValue([]);
	});

	it('asks for every Destination when the grid sets no Countries or Destination Attributes', async () => {
		await loadAllDestinations({ countries: [], attributes: [] });
		expect(sentQuery()).toEqual({
			version: 'draft',
			content_type: 'destination',
		});
	});

	it('asks only for Destinations in any of the Countries', async () => {
		await loadAllDestinations({
			countries: ['italy', 'greece'],
			attributes: [],
		});
		expect(sentQuery().filter_query).toEqual({
			country: { in: 'italy,greece' },
		});
	});

	it('asks only for Destinations carrying any of the Destination Attributes', async () => {
		await loadAllDestinations({
			countries: [],
			attributes: ['beach', 'city'],
		});
		expect(sentQuery().filter_query).toEqual({
			attributes: { any_in_array: 'beach,city' },
		});
	});

	it('asks for Destinations that pass both Countries and Destination Attributes', async () => {
		await loadAllDestinations({
			countries: ['portugal'],
			attributes: ['beach'],
		});
		expect(sentQuery().filter_query).toEqual({
			country: { in: 'portugal' },
			attributes: { any_in_array: 'beach' },
		});
	});

	it('returns the Destinations the Delivery API sends back', async () => {
		const lisbon = { uuid: 'lisbon', content: { name: 'Lisbon' } };
		getAll.mockResolvedValue([lisbon]);
		expect(
			await loadAllDestinations({ countries: [], attributes: [] }),
		).toEqual([lisbon]);
	});
});

describe('loadDestinations', () => {
	const santorini = { uuid: 'santorini', content: { country: 'greece' } };
	const lisbon = { uuid: 'lisbon', content: { country: 'portugal' } };

	beforeEach(() => {
		getAll.mockReset();
		getAll.mockResolvedValue([santorini, lisbon]);
	});

	it('uses the picked Destinations in the editor order when the editor picked any', async () => {
		const loaded = await loadDestinations({
			destinations: [lisbon, santorini],
			countries: ['greece'],
		});
		expect(loaded).toEqual([lisbon, santorini]);
		expect(getAll).not.toHaveBeenCalled();
	});

	it('leaves out a picked Destination that did not resolve', async () => {
		const loaded = await loadDestinations({
			destinations: ['missing-uuid', santorini],
		});
		expect(loaded).toEqual([santorini]);
	});

	it('loads no Destinations when no picked Destination resolves', async () => {
		const loaded = await loadDestinations({
			destinations: ['missing-uuid', 'other-uuid'],
		});
		expect(loaded).toEqual([]);
		expect(getAll).not.toHaveBeenCalled();
	});

	it("loads the Destinations in the grid's Countries and Destination Attributes when the editor picked none", async () => {
		const loaded = await loadDestinations({
			destinations: [],
			countries: ['portugal'],
			attributes: ['beach'],
		});
		expect(loaded).toEqual([santorini, lisbon]);
		expect(sentQuery().filter_query).toEqual({
			country: { in: 'portugal' },
			attributes: { any_in_array: 'beach' },
		});
	});
});

describe('DestinationGrid', () => {
	const lisbon = {
		uuid: 'lisbon',
		content: { name: 'Lisbon', country: 'portugal' },
	};
	const porto = {
		uuid: 'porto',
		content: { name: 'Porto', country: 'portugal' },
	};
	const lisbonPage = {
		full_slug: 'destinations/lisbon',
		content: { destination: 'lisbon' },
	};

	const render = async (settings) =>
		renderToStaticMarkup(
			await DestinationGrid({
				blok: {
					_uid: 'grid-uid',
					component: 'destination_grid',
					headline: 'More places in Portugal',
					...settings,
				},
				searchParams: {},
			}),
		);

	beforeEach(() => {
		getAll.mockReset();
		getAll.mockResolvedValue([]);
		get.mockReset();
		get.mockResolvedValue({ data: { stories: [lisbonPage] } });
	});

	it('shows the Pool as a Carousel when the carousel setting is on and search is off', async () => {
		const html = await render({
			carousel: true,
			destinations: [lisbon, porto],
		});
		expect(html).toContain('aria-roledescription="carousel"');
		expect(html).toMatch(/<li[^>]*><a [^>]*href="\/destinations\/lisbon"/);
		expect(html).toContain('2 places');
	});

	it('hides the Destination count of a Carousel with an empty Pool', async () => {
		const html = await render({ carousel: true, destinations: [] });
		expect(html).toContain('aria-roledescription="carousel"');
		expect(html).not.toContain('0 places');
	});

	it('shows the Pool as a grid when the carousel setting is off', async () => {
		const html = await render({
			carousel: false,
			destinations: [lisbon, porto],
		});
		expect(html).not.toContain('aria-roledescription="carousel"');
		expect(html).not.toContain('<li');
		expect(html).toContain('href="/destinations/lisbon"');
	});

	it('shows the searchable grid when search is on, even with the carousel setting on', async () => {
		const html = await render({
			carousel: true,
			search_enabled: true,
			destinations: [lisbon, porto],
		});
		expect(html).not.toContain('aria-roledescription="carousel"');
		expect(html).toContain('role="search"');
		expect(html).toContain('href="/destinations/lisbon"');
	});
});
