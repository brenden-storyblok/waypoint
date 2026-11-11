import { beforeEach, describe, expect, it, vi } from 'vitest';

const getDatasourceEntries = vi.fn();
const lang = vi.fn();
vi.mock('next/root-params', () => ({ lang }));
vi.mock('@/lib/content', () => ({ getDatasourceEntries }));

const { getLabel, loadLabels } = await import('@/lib/labels');

const entries = [
	{ value: 'done', name: 'Done', dimension_value: 'Fertig' },
	{ value: 'clear-all', name: 'Clear all', dimension_value: null },
];

beforeEach(() => {
	getDatasourceEntries.mockReset();
	getDatasourceEntries.mockResolvedValue(entries);
});

describe('loadLabels', () => {
	it('maps each entry value to its label, in datasource order', async () => {
		const labels = await loadLabels('countries', 'de');
		expect(Object.entries(labels)).toEqual([
			['done', 'Fertig'],
			['clear-all', 'Clear all'],
		]);
	});

	it('reads the datasource in the Language', async () => {
		await loadLabels('countries', 'de');
		expect(getDatasourceEntries).toHaveBeenCalledWith('countries', 'de');
	});

	it('shows the English names when the entries carry no translation', async () => {
		// Without a dimension the API sends no dimension_value.
		getDatasourceEntries.mockResolvedValue([{ value: 'done', name: 'Done' }]);
		const labels = await loadLabels('countries', 'en');
		expect(labels.done).toBe('Done');
	});

	it('falls back to an empty map when the request fails', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => {});
		getDatasourceEntries.mockRejectedValue(new Error('down'));
		expect(await loadLabels('countries', 'de')).toEqual({});
	});
});

describe('getLabel', () => {
	beforeEach(() => {
		lang.mockResolvedValue('de');
	});

	it('returns the translated UI Label', async () => {
		expect(await getLabel('done')).toBe('Fertig');
		expect(getDatasourceEntries).toHaveBeenCalledWith('ui-labels', 'de');
	});

	it('returns the English label when the entry has no translation', async () => {
		expect(await getLabel('clear-all')).toBe('Clear all');
	});

	it('returns the key when no entry matches', async () => {
		expect(await getLabel('missing-key')).toBe('missing-key');
	});
});
