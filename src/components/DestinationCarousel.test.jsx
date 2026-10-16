import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import DestinationCarousel from '@/components/DestinationCarousel';

const render = (props) =>
	renderToStaticMarkup(
		<DestinationCarousel
			headline="More places"
			placesLabel="2 places"
			{...props}
		>
			<div key="lisbon">Lisbon card</div>
			<div key="porto">Porto card</div>
		</DestinationCarousel>,
	);

// The opening tag of the element carrying the carousel role description.
const regionTag = (html) =>
	html.match(/<[^>]*aria-roledescription="carousel"[^>]*>/)?.[0] ?? '';

// The opening tag of the button with the given accessible label.
const buttonTag = (html, label) =>
	html.match(new RegExp(`<button[^>]*aria-label="${label}"[^>]*>`))?.[0] ??
	'';

describe('DestinationCarousel', () => {
	it('is a carousel region named after the headline', () => {
		const html = render();
		const region = regionTag(html);
		// A <section> with an accessible name is a region landmark.
		expect(region).toMatch(
			/^<section aria-roledescription="carousel" aria-labelledby="[^"]+">$/,
		);
		const labelId = region.match(/aria-labelledby="([^"]+)"/)?.[1];
		expect(labelId).toBeTruthy();
		expect(html).toMatch(
			new RegExp(`<h2 [^>]*id="${labelId}"[^>]*>More places</h2>`),
		);
	});

	it('names the region "Destinations" when there is no headline', () => {
		const html = render({ headline: '' });
		expect(regionTag(html)).toContain('aria-label="Destinations"');
		expect(regionTag(html)).not.toContain('aria-labelledby');
		expect(html).not.toContain('<h2');
	});

	it('puts each card in its own item of one list', () => {
		const html = render();
		const list = html.match(/<ul[^>]*>(.*)<\/ul>/)?.[1] ?? '';
		const items = [...list.matchAll(/<li[^>]*>(.*?)<\/li>/g)].map(
			(match) => match[1],
		);
		expect(items).toEqual(['<div>Lisbon card</div>', '<div>Porto card</div>']);
	});

	it('shows the Destination count', () => {
		expect(render()).toMatch(/<span[^>]*>2 places<\/span>/);
	});

	it('has Previous and Next buttons that control the card list', () => {
		const html = render();
		const listId = html.match(/<ul [^>]*id="([^"]+)"/)?.[1];
		expect(listId).toBeTruthy();
		for (const label of ['Previous destinations', 'Next destinations']) {
			const button = buttonTag(html, label);
			expect(button).toMatch(/^<button/);
			expect(button).toContain(`aria-controls="${listId}"`);
		}
	});

	it('hides the arrows until the browser measures an overflow', () => {
		// Without JavaScript the arrows do nothing, and the row may fit.
		expect(render()).toMatch(
			/<div [^>]*hidden=""[^>]*><button[^>]*aria-label="Previous destinations"/,
		);
	});

	it('starts at the beginning of the row, with only Previous unavailable', () => {
		const html = render();
		const previous = buttonTag(html, 'Previous destinations');
		const next = buttonTag(html, 'Next destinations');
		expect(previous).toContain('aria-disabled="true"');
		expect(next).not.toContain('aria-disabled="true"');
		// aria-disabled instead of disabled, so the buttons keep focus.
		expect(previous).not.toMatch(/\sdisabled[\s=>]/);
		expect(next).not.toMatch(/\sdisabled[\s=>]/);
	});
});
