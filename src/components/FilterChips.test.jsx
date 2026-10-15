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
			/>
		);
		expect(html).toBe(
			'<div class="filter-chips" role="group" aria-label="Country">' +
				'<span class="filter-chips__heading" aria-hidden="true">Country</span>' +
				'<button type="button" class="filter-chips__chip" aria-pressed="false">Italy</button>' +
				'<button type="button" class="filter-chips__chip" aria-pressed="true">Greece</button>' +
				'</div>'
		);
	});

	it('shows a group with a single chip', () => {
		const html = renderToStaticMarkup(
			<FilterChips heading="Country" chips={[chips[1]]} selected={[]} />
		);
		expect(html).toContain('aria-pressed="false">Greece</button>');
	});

	it('renders nothing when there are no chips', () => {
		expect(
			renderToStaticMarkup(<FilterChips heading="Country" chips={[]} selected={[]} />)
		).toBe('');
	});
});
