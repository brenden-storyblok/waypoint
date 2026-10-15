import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import FilterChips from '@/components/FilterChips';

const options = [
	{ value: 'beach', label: 'Beach' },
	{ value: 'city', label: 'City' },
];

describe('FilterChips', () => {
	it('shows each chip as a toggle button exposing its selected state', () => {
		const html = renderToStaticMarkup(
			<FilterChips label="Attributes" options={options} selected={['city']} />,
		);
		expect(html).toContain('role="group"');
		expect(html).toContain('>Attributes</span>');
		expect(html).toMatch(/<button type="button"[^>]*aria-pressed="false"[^>]*>Beach<\/button>/);
		expect(html).toMatch(/<button type="button"[^>]*aria-pressed="true"[^>]*>City<\/button>/);
	});

	it('still shows a group with a single chip', () => {
		const html = renderToStaticMarkup(
			<FilterChips label="Attributes" options={[options[0]]} selected={[]} />,
		);
		expect(html).toContain('>Beach</button>');
	});

	it('shows nothing when there are no chips', () => {
		expect(
			renderToStaticMarkup(<FilterChips label="Attributes" options={[]} selected={[]} />),
		).toBe('');
	});
});
