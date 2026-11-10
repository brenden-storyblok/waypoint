import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

const getAll = vi.fn();
const get = vi.fn();
vi.mock('@/lib/storyblok', () => ({
	getStoryblokApi: () => ({ getAll, get }),
}));

const getCurrentLanguage = vi.fn();
vi.mock('@/lib/currentLanguage', () => ({ getCurrentLanguage }));

const {
	default: DestinationGrid,
	loadAllDestinations,
	loadDestinations,
} = await import('@/components/DestinationGrid');

beforeEach(() => {
	getCurrentLanguage.mockResolvedValue('en');
});

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
	describe('in a Language', () => {
		const pool = { destinations: [lisbon], carousel: true };

		it('asks Storyblok for German Destinations and page lookups', async () => {
			getCurrentLanguage.mockResolvedValue('de');
			await render({
				carousel: true,
				destinations: [],
				countries: ['portugal'],
			});
			await render(pool);
			expect(getAll.mock.calls[0][1].language).toBe('de');
			expect(get.mock.calls[0][1].language).toBe('de');
		});

		it('sends no language parameter for English', async () => {
			await render({
				carousel: true,
				destinations: [],
				countries: ['portugal'],
			});
			await render(pool);
			expect(getAll.mock.calls[0][1]).not.toHaveProperty('language');
			expect(get.mock.calls[0][1]).not.toHaveProperty('language');
		});
	});

	describe('Filter labels', () => {
		const searching = { search_enabled: true, destinations: [lisbon, porto] };
		const entries = {
			countries: [
				{ value: 'portugal', name: 'Portugal', dimension_value: 'Portugal DE' },
			],
			'destination-attributes': [
				{ value: 'beach', name: 'Beach', dimension_value: null },
			],
		};
		const datasourceCalls = () =>
			getAll.mock.calls.filter(
				([path, query]) =>
					path === 'cdn/datasource_entries' && query.datasource !== 'ui-labels',
			);

		beforeEach(() => {
			getAll.mockImplementation(async (path, query) =>
				path === 'cdn/datasource_entries'
					? (entries[query.datasource] ?? [])
					: [],
			);
		});

		it('asks for the German dimension of both datasources', async () => {
			getCurrentLanguage.mockResolvedValue('de');
			await render(searching);
			const calls = datasourceCalls();
			expect(calls.map(([, query]) => query)).toEqual([
				{ datasource: 'countries', dimension: 'de' },
				{ datasource: 'destination-attributes', dimension: 'de' },
			]);
		});

		it('sends no dimension for English', async () => {
			await render(searching);
			for (const [, query] of datasourceCalls()) {
				expect(query).not.toHaveProperty('dimension');
			}
			expect(datasourceCalls()).toHaveLength(2);
		});

		it('shows the translated label, and the English one when the entry has no translation', async () => {
			getCurrentLanguage.mockResolvedValue('de');
			const beachy = {
				...lisbon,
				content: { ...lisbon.content, attributes: ['beach'] },
			};
			const html = await render({ ...searching, destinations: [beachy] });
			expect(html).toContain('Portugal DE');
			expect(html).toContain('Beach');
		});
	});

	describe('UI Labels', () => {
		const uiLabels = [
			['search-placeholder', 'Search destinations', 'Reiseziele suchen'],
			[
				'empty-message',
				'No destinations match your search.',
				'Keine Reiseziele entsprechen Ihrer Suche.',
			],
			['clear-all', 'Clear all', 'Alle löschen'],
			['attributes-heading', 'Attributes', 'Merkmale'],
			['country-heading', 'Country', 'Land'],
			['clear-group', 'Clear', 'Löschen'],
			['done', 'Done', 'Fertig'],
			['carousel-label', 'Destinations', 'Reiseziele'],
			['carousel-previous', 'Previous destinations', 'Vorherige Reiseziele'],
			['carousel-next', 'Next destinations', 'Nächste Reiseziele'],
		].map(([value, name, german]) => ({
			value,
			name,
			dimension_value: german,
		}));
		const beachy = {
			...lisbon,
			content: { ...lisbon.content, attributes: ['beach'] },
		};
		const searching = { search_enabled: true, destinations: [beachy, porto] };

		beforeEach(() => {
			getAll.mockImplementation(async (path, query) =>
				path === 'cdn/datasource_entries' && query.datasource === 'ui-labels'
					? uiLabels.map((entry) => ({
							...entry,
							// The Delivery API sends the translation only with a dimension.
							dimension_value: query.dimension ? entry.dimension_value : null,
						}))
					: [],
			);
		});

		it('shows the English grid controls from ui-labels', async () => {
			const html = await render(searching);
			expect(html).toContain('placeholder="Search destinations"');
			expect(html).toContain('>Clear</button>');
			expect(html).toContain('>Done</button>');
			expect(html).toContain('>Attributes<');
			expect(html).toContain('>Country<');
		});

		it('shows the German grid controls and asks for the German dimension', async () => {
			getCurrentLanguage.mockResolvedValue('de');
			const html = await render(searching);
			expect(html).toContain('placeholder="Reiseziele suchen"');
			expect(html).toContain('>Löschen</button>');
			expect(html).toContain('>Fertig</button>');
			expect(html).toContain('>Merkmale<');
			expect(html).toContain('>Land<');
			expect(html).not.toContain('>Clear</button>');
			const queries = getAll.mock.calls.map(([, query]) => query);
			expect(queries).toContainEqual({
				datasource: 'ui-labels',
				dimension: 'de',
			});
		});

		it('shows the German empty message and Clear all', async () => {
			getCurrentLanguage.mockResolvedValue('de');
			const html = await render({ ...searching, destinations: [] });
			expect(html).toContain('Keine Reiseziele entsprechen Ihrer Suche.');
			expect(html).toContain('Alle löschen');
		});

		it('ignores label values stored on the grid blok', async () => {
			const html = await render({ ...searching, clear_group_label: 'Reset' });
			expect(html).not.toContain('Reset');
		});

		it('shows the English carousel labels', async () => {
			const html = await render({
				carousel: true,
				headline: '',
				destinations: [lisbon, porto],
			});
			expect(html).toContain('aria-label="Destinations"');
			expect(html).toContain('aria-label="Previous destinations"');
			expect(html).toContain('aria-label="Next destinations"');
		});

		it('shows the German carousel labels', async () => {
			getCurrentLanguage.mockResolvedValue('de');
			const html = await render({
				carousel: true,
				headline: '',
				destinations: [lisbon, porto],
			});
			expect(html).toContain('aria-label="Reiseziele"');
			expect(html).toContain('aria-label="Vorherige Reiseziele"');
			expect(html).toContain('aria-label="Nächste Reiseziele"');
		});
	});
});
