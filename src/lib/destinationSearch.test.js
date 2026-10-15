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
});
