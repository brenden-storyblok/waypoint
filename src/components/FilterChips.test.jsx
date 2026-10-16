import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import FilterChips from '@/components/FilterChips';

const chips = [
	{ value: 'italy', label: 'Italy' },
	{ value: 'greece', label: 'Greece' },
];

describe('FilterChips', () => {
	it('renders a labelled group of toggle buttons that expose their selected state', () => {
		const html = renderToStaticMarkup(
			<FilterChips
				heading="Country"
				chips={chips}
				selected={['greece']}
				onToggle={() => {}}
			/>,
		);
		expect(html).toMatch(/^<div [^>]*role="group" aria-label="Country">/);
		expect(html).toMatch(/<span [^>]*aria-hidden="true">Country<\/span>/);
		expect(html).toMatch(
			/<button type="button" [^>]*aria-pressed="false">Italy<\/button>/,
		);
		expect(html).toMatch(
			/<button type="button" [^>]*aria-pressed="true">Greece<\/button>/,
		);
	});

	it('shows a group with a single chip', () => {
		const html = renderToStaticMarkup(
			<FilterChips heading="Country" chips={[chips[1]]} selected={[]} />,
		);
		expect(html).toContain('aria-pressed="false">Greece</button>');
	});

	it('renders nothing when there are no chips', () => {
		expect(
			renderToStaticMarkup(
				<FilterChips heading="Country" chips={[]} selected={[]} />,
			),
		).toBe('');
	});
});
