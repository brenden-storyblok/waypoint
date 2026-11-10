import { beforeEach, describe, expect, it, vi } from 'vitest';

const getAll = vi.fn();
vi.mock('@/lib/storyblok', () => ({
	getStoryblokApi: () => ({ getAll }),
}));

const { getLabel, loadLabels } = await import('@/lib/labels');

const entries = [
	{ value: 'done', name: 'Done', dimension_value: 'Fertig' },
	{ value: 'clear-all', name: 'Clear all', dimension_value: null },
];

beforeEach(() => {
	getAll.mockReset();
	getAll.mockResolvedValue(entries);
});

describe('loadLabels', () => {
	it('maps each entry value to its label, in datasource order', async () => {
		const labels = await loadLabels('countries', 'de');
		expect(Object.entries(labels)).toEqual([
			['done', 'Fertig'],
			['clear-all', 'Clear all'],
		]);
	});

	it('asks for the dimension of a non-default Language', async () => {
		await loadLabels('countries', 'de');
		expect(getAll.mock.calls[0][1]).toEqual({
			datasource: 'countries',
			dimension: 'de',
		});
	});

	it('sends no dimension for English and shows the English names', async () => {
		// Without a dimension the API sends no dimension_value.
		getAll.mockResolvedValue([{ value: 'done', name: 'Done' }]);
		const labels = await loadLabels('countries', 'en');
		expect(getAll.mock.calls[0][1]).toEqual({ datasource: 'countries' });
		expect(labels.done).toBe('Done');
	});

	it('falls back to an empty map when the request fails', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => {});
		getAll.mockRejectedValue(new Error('down'));
		expect(await loadLabels('countries', 'de')).toEqual({});
	});
});

describe('getLabel', () => {
	it('returns the translated UI Label', async () => {
		expect(await getLabel('done', 'de')).toBe('Fertig');
		expect(getAll.mock.calls[0][1].datasource).toBe('ui-labels');
	});

	it('returns the English label when the entry has no translation', async () => {
		expect(await getLabel('clear-all', 'de')).toBe('Clear all');
	});

	it('returns the key when no entry matches', async () => {
		expect(await getLabel('missing-key', 'de')).toBe('missing-key');
	});
});
