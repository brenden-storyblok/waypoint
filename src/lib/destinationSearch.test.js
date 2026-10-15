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

const chipValues = (chips) => chips.map((c) => c.value);

describe('Country chips', () => {
	it('offer only Countries some Destination in the Pool carries, with datasource labels', () => {
		const result = search('', {
			picked: [lisbon.uuid, santorini.uuid, amalfiCoast.uuid, seville.uuid],
		});
		expect(result.chips.countries).toEqual([
			{ value: 'spain', label: 'Spain' },
			{ value: 'italy', label: 'Italy' },
			{ value: 'greece', label: 'Greece' },
			{ value: 'portugal', label: 'Portugal' },
		]);
	});

	it('show one chip when the Pool covers one Country', () => {
		const result = search('', { picked: [], countries: ['greece'] });
		expect(result.chips.countries).toEqual([{ value: 'greece', label: 'Greece' }]);
	});

	it('offer each Country once and keep a Country with no label as its value', () => {
		const result = searchDestinations({
			destinations: [
				lisbon,
				{ ...seville, uuid: 'x', country: 'portugal' },
				{ uuid: 'z', name: 'Zürich', country: 'switzerland', attributes: [] },
			],
			labels: { countries: countryLabels },
		});
		expect(result.chips.countries).toEqual([
			{ value: 'portugal', label: 'Portugal' },
			{ value: 'switzerland', label: 'switzerland' },
		]);
	});

	it('do not change as the visitor narrows the grid', () => {
		const result = searchDestinations({
			destinations: allDestinations,
			choices: { text: 'lis', countries: ['italy'] },
			labels: { countries: countryLabels },
		});
		expect(chipValues(result.chips.countries)).toEqual([
			'france',
			'spain',
			'italy',
			'greece',
			'portugal',
			'germany',
		]);
	});
});

const filter = (choices, settings = { picked: [] }) =>
	searchDestinations({
		destinations: allDestinations,
		settings,
		choices,
		labels: { countries: countryLabels },
	});

describe('Country Filters', () => {
	it('show Destinations in any selected Country', () => {
		const result = filter({ countries: ['italy', 'greece'] });
		expect(names(result.visible)).toEqual(['Amalfi Coast', 'Santorini']);
		expect(result.counts).toEqual({ visible: 2, pool: 6 });
		expect(result.narrowed).toBe(true);
		expect(placesLabel(result)).toBe('2 of 6 places');
	});

	it('combine with Search Text: a Destination passes both', () => {
		expect(
			names(filter({ countries: ['italy', 'greece'], text: 'santo' }).visible),
		).toEqual(['Santorini']);
		expect(
			names(filter({ countries: ['italy', 'greece'], text: 'lisbon' }).visible),
		).toEqual([]);
	});

	it('keep the editor order of the Pool', () => {
		const result = filter(
			{ countries: ['italy', 'greece'] },
			{ picked: [santorini.uuid, lisbon.uuid, amalfiCoast.uuid] },
		);
		expect(names(result.visible)).toEqual(['Santorini', 'Amalfi Coast']);
	});

	it('ignore a Country no Destination in the Pool carries', () => {
		const result = filter(
			{ countries: ['germany'] },
			{ picked: [], countries: ['italy', 'greece'] },
		);
		expect(names(result.visible)).toEqual(['Amalfi Coast', 'Santorini']);
		expect(result.narrowed).toBe(false);
	});

	it('show the whole Pool when none are selected', () => {
		const result = filter({ countries: [] });
		expect(result.counts).toEqual({ visible: 6, pool: 6 });
		expect(result.narrowed).toBe(false);
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
		expect(parseChoices({ q: 'lis' }).text).toBe('lis');
	});

	it('reads Search Text from q in URLSearchParams', () => {
		expect(parseChoices(new URLSearchParams('q=s%C3%A9villa')).text).toBe(
			'sévilla',
		);
	});

	it('reads the first q when the URL repeats it', () => {
		expect(parseChoices({ q: ['lis', 'spain'] }).text).toBe('lis');
	});

	it('reads no choices from an empty or missing query', () => {
		expect(parseChoices({})).toEqual({ text: '', countries: [] });
		expect(parseChoices(new URLSearchParams(''))).toEqual({ text: '', countries: [] });
		expect(parseChoices(undefined)).toEqual({ text: '', countries: [] });
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

	it('reads every repeated country param as Country Filters', () => {
		expect(parseChoices({ country: ['italy', 'greece'] }).countries).toEqual([
			'italy',
			'greece',
		]);
		expect(parseChoices({ country: 'italy' }).countries).toEqual(['italy']);
		expect(
			parseChoices(new URLSearchParams('country=italy&q=s&country=greece')),
		).toEqual({ text: 's', countries: ['italy', 'greece'] });
		expect(parseChoices(undefined).countries).toEqual([]);
	});

	it('writes country once per selected Country', () => {
		expect(
			serialiseChoices({ text: 'santo', countries: ['italy', 'greece'] }),
		).toBe('q=santo&country=italy&country=greece');
		expect(
			serialiseChoices({ text: '', countries: [] }, '_storyblok=1&country=spain'),
		).toBe('_storyblok=1');
	});

	it('round-trips Country Filters with Search Text through the URL', () => {
		for (const choices of [
			{ text: 'santo', countries: ['italy', 'greece'] },
			{ text: '', countries: ['portugal'] },
			{ text: '', countries: [] },
		]) {
			const qs = serialiseChoices(choices, '_storyblok=1');
			expect(parseChoices(new URLSearchParams(qs))).toEqual(choices);
		}
	});

	it('round-trips choices through the URL', () => {
		for (const choices of [
			{ text: 'lis', countries: [] },
			{ text: 'SEVÍLLE & co', countries: [] },
			{ text: '', countries: [] },
		]) {
			const qs = serialiseChoices(choices);
			expect(parseChoices(new URLSearchParams(qs))).toEqual(choices);
		}
	});
});
