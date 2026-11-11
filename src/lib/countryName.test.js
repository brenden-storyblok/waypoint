import { describe, expect, it } from 'vitest';
import { countryName } from '@/lib/countryName';

describe('countryName', () => {
	it('returns the label of the stored Country key', () => {
		expect(countryName({ italy: 'Italien' }, 'italy')).toBe('Italien');
	});

	it('capitalises the stored key when no label exists for it', () => {
		expect(countryName({}, 'portugal')).toBe('Portugal');
	});

	it('returns an empty string without a key', () => {
		expect(countryName({ italy: 'Italien' }, undefined)).toBe('');
	});
});
