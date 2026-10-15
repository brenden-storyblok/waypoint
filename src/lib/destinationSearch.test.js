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
		expect(parseChoices({ q: 'lis' })).toEqual({ text: 'lis' });
	});

	it('reads Search Text from q in URLSearchParams', () => {
		expect(parseChoices(new URLSearchParams('q=s%C3%A9villa'))).toEqual({
			text: 'sévilla',
		});
	});

	it('reads the first q when the URL repeats it', () => {
		expect(parseChoices({ q: ['lis', 'spain'] })).toEqual({ text: 'lis' });
	});

	it('reads no choices from an empty or missing query', () => {
		expect(parseChoices({})).toEqual({ text: '' });
		expect(parseChoices(new URLSearchParams(''))).toEqual({ text: '' });
		expect(parseChoices(undefined)).toEqual({ text: '' });
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
		for (const choices of [{ text: 'lis' }, { text: 'SEVÍLLE & co' }, { text: '' }]) {
			const qs = serialiseChoices(choices);
			expect(parseChoices(new URLSearchParams(qs))).toEqual(choices);
		}
	});
});
