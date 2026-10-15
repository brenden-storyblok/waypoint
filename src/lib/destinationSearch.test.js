import { describe, expect, it } from 'vitest';
import {
	parseChoices,
	placesLabel,
	searchDestinations,
	serialiseChoices,
} from '@/lib/destinationSearch';

// The six Destinations in space 295888311565739, in Delivery API order.
const seville = {
	uuid: '7901bdb6-3c8b-46d6-ab0f-2b76535f4173',
	name: 'Seville',
	country: 'spain',
	attributes: ['city', 'culture', 'food'],
};
const amalfiCoast = {
	uuid: '9328b74a-df5b-4a00-aa5d-e55334dfd894',
	name: 'Amalfi Coast',
	country: 'italy',
	attributes: ['beach', 'coast', 'food'],
};
const provence = {
	uuid: 'ae062cbc-5fe7-4a7e-b432-ec6eede5915c',
	name: 'Provence',
	country: 'france',
	attributes: ['nature', 'countryside', 'food'],
};
const bavarianAlps = {
	uuid: '7e2fc354-d07b-43c6-bb01-6a71ff5154ac',
	name: 'Bavarian Alps',
	country: 'germany',
	attributes: ['nature', 'mountains'],
};
const santorini = {
	uuid: 'ac3b622d-9174-4213-9c3a-b6134090e62e',
	name: 'Santorini',
	country: 'greece',
	attributes: ['beach', 'island'],
};
const lisbon = {
	uuid: '3dcce03c-2e9c-4b9a-b12c-0452cc3370c4',
	name: 'Lisbon',
	country: 'portugal',
	attributes: ['city', 'beach', 'culture'],
};

const allDestinations = [
	seville,
	amalfiCoast,
	provence,
	bavarianAlps,
	santorini,
	lisbon,
];

const names = (list) => list.map((d) => d.name);

describe('searchDestinations', () => {
	describe('Pool', () => {
		it('holds every Destination when the editor picked none', () => {
			const result = searchDestinations({
				destinations: allDestinations,
				settings: { picked: [] },
			});

			expect(names(result.pool)).toEqual([
				'Seville',
				'Amalfi Coast',
				'Provence',
				'Bavarian Alps',
				'Santorini',
				'Lisbon',
			]);
			expect(names(result.visible)).toEqual(names(result.pool));
			expect(result.counts).toEqual({ visible: 6, pool: 6 });
		});

		it('holds only the picked Destinations, in the editor order', () => {
			const result = searchDestinations({
				destinations: allDestinations,
				settings: { picked: [santorini.uuid, lisbon.uuid, provence.uuid] },
			});

			expect(names(result.pool)).toEqual(['Santorini', 'Lisbon', 'Provence']);
			expect(names(result.visible)).toEqual(['Santorini', 'Lisbon', 'Provence']);
			expect(result.counts).toEqual({ visible: 3, pool: 3 });
		});

		it('leaves out a picked Destination that is not loaded', () => {
			const result = searchDestinations({
				destinations: [seville, lisbon],
				settings: { picked: [lisbon.uuid, santorini.uuid, seville.uuid] },
			});

			expect(names(result.pool)).toEqual(['Lisbon', 'Seville']);
			expect(result.counts).toEqual({ visible: 2, pool: 2 });
		});

		it('is empty when every picked Destination is not loaded', () => {
			const result = searchDestinations({
				destinations: [],
				settings: { picked: [santorini.uuid, lisbon.uuid] },
			});

			expect(result.pool).toEqual([]);
			expect(result.visible).toEqual([]);
			expect(result.counts).toEqual({ visible: 0, pool: 0 });
		});
	});

	describe('Destination Attributes', () => {
		it('narrow the Pool to Destinations carrying the chosen one', () => {
			const result = searchDestinations({
				destinations: allDestinations,
				settings: { picked: [], attributes: ['beach'] },
			});

			expect(names(result.pool)).toEqual([
				'Amalfi Coast',
				'Santorini',
				'Lisbon',
			]);
			expect(result.counts).toEqual({ visible: 3, pool: 3 });
		});

		it('keep a Destination carrying any of several chosen ones', () => {
			const result = searchDestinations({
				destinations: allDestinations,
				settings: { picked: [], attributes: ['beach', 'city'] },
			});

			expect(names(result.pool)).toEqual([
				'Seville',
				'Amalfi Coast',
				'Santorini',
				'Lisbon',
			]);
		});

		it('narrow the picked Destinations, keeping the editor order', () => {
			const result = searchDestinations({
				destinations: allDestinations,
				settings: {
					picked: [lisbon.uuid, provence.uuid, seville.uuid, santorini.uuid],
					attributes: ['beach'],
				},
			});

			expect(names(result.pool)).toEqual(['Lisbon', 'Santorini']);
			expect(result.counts).toEqual({ visible: 2, pool: 2 });
		});

		it('leave the Pool empty when no Destination carries the chosen one', () => {
			const result = searchDestinations({
				destinations: allDestinations,
				settings: { picked: [seville.uuid, provence.uuid], attributes: ['island'] },
			});

			expect(result.pool).toEqual([]);
			expect(result.counts).toEqual({ visible: 0, pool: 0 });
		});
	});

	describe('Pool narrowed by editor Countries', () => {
		it('keeps a Destination in any chosen Country when nothing is picked', () => {
			const result = searchDestinations({
				destinations: allDestinations,
				settings: { picked: [], countries: ['italy', 'greece'] },
			});

			expect(names(result.pool)).toEqual(['Amalfi Coast', 'Santorini']);
			expect(names(result.visible)).toEqual(['Amalfi Coast', 'Santorini']);
			expect(result.counts).toEqual({ visible: 2, pool: 2 });
		});

		it('keeps only the picked Destinations in a chosen Country, in the editor order', () => {
			const result = searchDestinations({
				destinations: allDestinations,
				settings: {
					picked: [lisbon.uuid, santorini.uuid, seville.uuid, amalfiCoast.uuid],
					countries: ['greece', 'spain'],
				},
			});

			expect(names(result.pool)).toEqual(['Santorini', 'Seville']);
			expect(result.counts).toEqual({ visible: 2, pool: 2 });
		});

		it('is empty when no picked Destination sits in a chosen Country', () => {
			const result = searchDestinations({
				destinations: allDestinations,
				settings: { picked: [lisbon.uuid, provence.uuid], countries: ['italy'] },
			});

			expect(result.pool).toEqual([]);
			expect(result.counts).toEqual({ visible: 0, pool: 0 });
		});

		it('leaves the Pool as before when no Countries are chosen', () => {
			const picks = searchDestinations({
				destinations: allDestinations,
				settings: { picked: [santorini.uuid, lisbon.uuid], countries: [] },
			});
			const noPicks = searchDestinations({
				destinations: allDestinations,
				settings: { picked: [] },
			});

			expect(names(picks.pool)).toEqual(['Santorini', 'Lisbon']);
			expect(names(noPicks.pool)).toEqual([
				'Seville',
				'Amalfi Coast',
				'Provence',
				'Bavarian Alps',
				'Santorini',
				'Lisbon',
			]);
		});
	});

	describe('Pool narrowed by Countries and Destination Attributes', () => {
		it('keeps only Destinations that pass both', () => {
			const result = searchDestinations({
				destinations: allDestinations,
				settings: { picked: [], countries: ['portugal'], attributes: ['beach'] },
			});

			expect(names(result.pool)).toEqual(['Lisbon']);
			expect(result.counts).toEqual({ visible: 1, pool: 1 });
		});
	});
});

const countryLabels = {
	france: 'France',
	spain: 'Spain',
	italy: 'Italy',
	greece: 'Greece',
	portugal: 'Portugal',
	germany: 'Germany',
};

const search = (text, settings = { picked: [] }) =>
	searchDestinations({
		destinations: allDestinations,
		settings,
		choices: { text },
		labels: { countries: countryLabels },
	});

describe('Search Text', () => {
	it('matches part of a Destination name', () => {
		expect(names(search('lis').visible)).toEqual(['Lisbon']);
	});

	it('matches the Country label a visitor sees', () => {
		const result = searchDestinations({
			destinations: allDestinations,
			settings: { picked: [] },
			choices: { text: 'spain' },
			labels: { countries: { ...countryLabels, spain: 'España' } },
		});
		expect(names(result.visible)).toEqual([]);
		expect(names(search('spain').visible)).toEqual(['Seville']);
	});

	it('ignores case', () => {
		expect(names(search('LISBON').visible)).toEqual(['Lisbon']);
		expect(names(search('SpAiN').visible)).toEqual(['Seville']);
	});

	it('ignores accents in the Search Text', () => {
		expect(names(search('SEVÍLLE').visible)).toEqual(['Seville']);
		expect(names(search('sevílla').visible)).toEqual(
			names(search('sevilla').visible),
		);
	});

	it('ignores accents in the Destination name and Country label', () => {
		const searchZurich = (text) =>
			searchDestinations({
				destinations: [
					{ uuid: 'z', name: 'Zürich', country: 'switzerland', attributes: [] },
				],
				choices: { text },
				labels: { countries: { switzerland: 'Suíça' } },
			});
		expect(names(searchZurich('zurich').visible)).toEqual(['Zürich']);
		expect(names(searchZurich('suica').visible)).toEqual(['Zürich']);
	});

	it('shows the whole Pool when empty or only spaces', () => {
		expect(search('').counts).toEqual({ visible: 6, pool: 6 });
		expect(search('   ').counts).toEqual({ visible: 6, pool: 6 });
	});

	it('trims spaces around the Search Text', () => {
		expect(names(search('  lis ').visible)).toEqual(['Lisbon']);
	});
});

describe('Search Text within the Pool', () => {
	it('only narrows the Pool, never adds to it', () => {
		const result = search('lis', { picked: [seville.uuid, provence.uuid] });
		expect(result.visible).toEqual([]);
		expect(result.counts).toEqual({ visible: 0, pool: 2 });
	});

	it('keeps the editor order of the Pool', () => {
		const result = search('e', { picked: [provence.uuid, seville.uuid] });
		expect(names(result.visible)).toEqual(['Provence', 'Seville']);
	});

	it('finds nothing when no Destination matches', () => {
		const result = search('oslo');
		expect(result.visible).toEqual([]);
		expect(result.counts).toEqual({ visible: 0, pool: 6 });
	});
});

describe('placesLabel', () => {
	it('reads "X of Y places" while Search Text narrows the Pool', () => {
		expect(placesLabel(search('lis'))).toBe('1 of 6 places');
		expect(placesLabel(search('oslo'))).toBe('0 of 6 places');
	});

	it('reads "Y places" with no Search Text', () => {
		expect(placesLabel(search(''))).toBe('6 places');
		expect(placesLabel(search(' '))).toBe('6 places');
		expect(placesLabel(search('', { picked: [lisbon.uuid] }))).toBe('1 place');
	});
});

describe('URL choices', () => {
	it('reads Search Text from q in a page searchParams object', () => {
		expect(parseChoices({ q: 'lis' })).toEqual({ text: 'lis', attributes: [] });
	});

	it('reads Search Text from q in URLSearchParams', () => {
		expect(parseChoices(new URLSearchParams('q=s%C3%A9villa'))).toEqual({
			text: 'sévilla',
			attributes: [],
		});
	});

	it('reads the first q when the URL repeats it', () => {
		expect(parseChoices({ q: ['lis', 'spain'] })).toEqual({ text: 'lis', attributes: [] });
	});

	it('reads no choices from an empty or missing query', () => {
		expect(parseChoices({})).toEqual({ text: '', attributes: [] });
		expect(parseChoices(new URLSearchParams(''))).toEqual({ text: '', attributes: [] });
		expect(parseChoices(undefined)).toEqual({ text: '', attributes: [] });
	});

	it('writes Search Text as q', () => {
		expect(serialiseChoices({ text: 'sévilla spain' })).toBe(
			'q=s%C3%A9villa+spain',
		);
	});

	it('writes an empty query for no choices', () => {
		expect(serialiseChoices({ text: '' })).toBe('');
		expect(serialiseChoices({ text: '  ' })).toBe('');
	});

	it('keeps unrelated params and replaces the old q', () => {
		const current = new URLSearchParams(
			'_storyblok=123&q=old&_storyblok_tk%5Btoken%5D=abc',
		);
		expect(serialiseChoices({ text: 'lis' }, current)).toBe(
			'_storyblok=123&_storyblok_tk%5Btoken%5D=abc&q=lis',
		);
		expect(serialiseChoices({ text: '' }, '?_storyblok=123&q=old')).toBe(
			'_storyblok=123',
		);
	});

	it('round-trips choices through the URL', () => {
		for (const choices of [{ text: 'lis', attributes: [] }, { text: 'SEVÍLLE & co', attributes: [] }, { text: '', attributes: [] }]) {
			const qs = serialiseChoices(choices);
			expect(parseChoices(new URLSearchParams(qs))).toEqual(choices);
		}
	});
});

const attributeLabels = {
	beach: 'Beach',
	city: 'City',
	nature: 'Nature',
	mountains: 'Mountains',
	island: 'Island',
	coast: 'Coast',
	countryside: 'Countryside',
	culture: 'Culture',
	food: 'Food',
	wellness: 'Wellness',
};

const filter = (attributes, settings = { picked: [] }, text = '') =>
	searchDestinations({
		destinations: allDestinations,
		settings,
		choices: { text, attributes },
		labels: { countries: countryLabels, attributes: attributeLabels },
	});

describe('Destination Attribute chips', () => {
	it('offer only Destination Attributes some Destination in the Pool carries, in datasource order', () => {
		const result = filter([], { picked: [santorini.uuid, bavarianAlps.uuid] });
		expect(result.options.attributes).toEqual([
			{ value: 'beach', label: 'Beach' },
			{ value: 'nature', label: 'Nature' },
			{ value: 'mountains', label: 'Mountains' },
			{ value: 'island', label: 'Island' },
		]);
	});

	it('still offer a single Destination Attribute', () => {
		const result = searchDestinations({
			destinations: [{ ...lisbon, attributes: ['city'] }],
			labels: { attributes: attributeLabels },
		});
		expect(result.options.attributes).toEqual([{ value: 'city', label: 'City' }]);
	});

	it('label a value missing from the datasource with the value itself', () => {
		const result = searchDestinations({
			destinations: [{ ...lisbon, attributes: ['surf', 'beach'] }],
			labels: { attributes: attributeLabels },
		});
		expect(result.options.attributes).toEqual([
			{ value: 'beach', label: 'Beach' },
			{ value: 'surf', label: 'surf' },
		]);
	});
});

describe('Destination Attribute Filters', () => {
	it('show Destinations carrying the selected one', () => {
		const result = filter(['beach']);
		expect(names(result.visible)).toEqual(['Amalfi Coast', 'Santorini', 'Lisbon']);
		expect(result.counts).toEqual({ visible: 3, pool: 6 });
		expect(placesLabel(result)).toBe('3 of 6 places');
	});

	it('show Destinations carrying any selected one', () => {
		expect(names(filter(['beach', 'city']).visible)).toEqual([
			'Seville',
			'Amalfi Coast',
			'Santorini',
			'Lisbon',
		]);
	});

	it('must pass together with Search Text', () => {
		expect(names(filter(['beach'], { picked: [] }, 'portugal').visible)).toEqual([
			'Lisbon',
		]);
		expect(names(filter(['beach'], { picked: [] }, 'seville').visible)).toEqual([]);
	});

	it('only narrow the Pool the editor set', () => {
		const result = filter(['beach'], { picked: [], countries: ['portugal', 'spain'] });
		expect(names(result.visible)).toEqual(['Lisbon']);
		expect(result.counts).toEqual({ visible: 1, pool: 2 });
	});

	it('leave the Pool whole when none is selected', () => {
		const result = filter([]);
		expect(result.counts).toEqual({ visible: 6, pool: 6 });
		expect(result.narrowed).toBe(false);
	});
});

describe('Destination Attribute Filters in the URL', () => {
	it('read every repeated attribute param', () => {
		expect(parseChoices({ attribute: ['beach', 'city'] }).attributes).toEqual([
			'beach',
			'city',
		]);
		expect(
			parseChoices(new URLSearchParams('attribute=beach&attribute=city')).attributes,
		).toEqual(['beach', 'city']);
		expect(parseChoices({ attribute: 'beach' }).attributes).toEqual(['beach']);
		expect(parseChoices({}).attributes).toEqual([]);
	});

	it('write attribute once per selected value, keeping other params', () => {
		expect(
			serialiseChoices(
				{ text: 'lis', attributes: ['beach', 'city'] },
				'_storyblok=1&attribute=old',
			),
		).toBe('_storyblok=1&q=lis&attribute=beach&attribute=city');
	});

	it('round-trip through the URL', () => {
		const choices = { text: '', attributes: ['beach', 'city'] };
		const qs = serialiseChoices(choices);
		expect(qs).toBe('attribute=beach&attribute=city');
		expect(parseChoices(new URLSearchParams(qs))).toEqual(choices);
	});

	it('are cleared by the empty choices', () => {
		expect(serialiseChoices(parseChoices(), 'q=lis&attribute=beach')).toBe('');
	});
});
