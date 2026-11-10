import { describe, expect, it } from 'vitest';
import { fillTemplate } from '@/lib/template';

describe('fillTemplate', () => {
	it('replaces each placeholder with its value', () => {
		expect(
			fillTemplate('{shown} of {total} places', { shown: 2, total: 6 }),
		).toBe('2 of 6 places');
	});

	it('replaces a placeholder that appears twice', () => {
		expect(fillTemplate('{count}/{count}', { count: 3 })).toBe('3/3');
	});

	it('leaves a placeholder without a value as written', () => {
		expect(fillTemplate('{count} places', {})).toBe('{count} places');
	});
});
