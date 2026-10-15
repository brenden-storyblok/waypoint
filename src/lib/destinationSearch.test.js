import { describe, expect, it } from 'vitest';
import { searchDestinations } from '@/lib/destinationSearch';

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
