import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import DestinationSearchView from '@/components/DestinationSearchView';
import { parseChoices, searchDestinations } from '@/lib/destinationSearch';

const texts = {
	placeholder: 'Search places',
	countryLabel: 'Country',
	attributesLabel: 'Type of place',
	emptyMessage: 'No places match.',
	clearLabel: 'Clear all',
};

const lisbon = {
	uuid: 'lisbon',
	name: 'Lisbon',
	country: 'portugal',
	attributes: ['city'],
};

const render = (props) =>
	renderToStaticMarkup(
		<DestinationSearchView
			headline="Places"
			cards={{ lisbon: <div>Lisbon card</div> }}
			texts={texts}
			{...props}
		/>,
	);

describe('DestinationSearchView', () => {
	it('links Clear all to the page without choices when it renders on the server with no matches', () => {
		const choices = parseChoices({ q: 'oslo' });
		const html = render({
			result: searchDestinations({ destinations: [lisbon], choices }),
			choices,
			clearHref: '?_storyblok=1',
		});
		expect(html).toContain('<p>No places match.</p>');
		expect(html).toMatch(/<a [^>]*href="\?_storyblok=1">Clear all<\/a>/);
	});

	it('shows Clear all as a button in the browser', () => {
		const choices = parseChoices({ q: 'oslo' });
		const noop = () => {};
		const html = render({
			result: searchDestinations({ destinations: [lisbon], choices }),
			choices,
			handlers: { onText: noop, onToggle: noop, onClear: noop },
		});
		expect(html).toMatch(/<button type="button" [^>]*>Clear all<\/button>/);
		expect(html).not.toContain('>Clear all</a>');
	});

	it('shows the matching cards and no Clear all', () => {
		const choices = parseChoices({ q: 'lis' });
		const html = render({
			result: searchDestinations({ destinations: [lisbon], choices }),
			choices,
			clearHref: '?',
		});
		expect(html).toContain('<div>Lisbon card</div>');
		expect(html).not.toContain('Clear all');
	});
});
