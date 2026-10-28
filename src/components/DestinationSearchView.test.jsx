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
	clearGroupLabel: 'Clear',
	doneLabel: 'Done',
};

const lisbon = {
	uuid: 'lisbon',
	name: 'Lisbon',
	country: 'portugal',
	attributes: ['city'],
};

const athens = {
	uuid: 'athens',
	name: 'Athens',
	country: 'greece',
	attributes: ['city', 'history'],
};

const labels = {
	countries: { portugal: 'Portugal', greece: 'Greece' },
	attributes: { city: 'City', history: 'History' },
};

const noop = () => {};
const handlers = {
	onText: noop,
	onToggle: noop,
	onClear: noop,
	onClearGroup: noop,
};

const renderPool = ({ query, ...props } = {}) => {
	const choices = parseChoices(query);
	return render({
		result: searchDestinations({
			destinations: [lisbon, athens],
			choices,
			labels,
		}),
		choices,
		clearHref: '?',
		...props,
	});
};

// The opening tag of the <details> whose summary shows `heading`.
const disclosureFor = (html, heading) =>
	html.match(new RegExp(`<details [^>]*>(?=<summary[^>]*>.*?${heading})`))?.[0];

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

	it('shows the matching cards and Clear all in the controls row', () => {
		const choices = parseChoices({ q: 'lis' });
		const html = render({
			result: searchDestinations({ destinations: [lisbon], choices }),
			choices,
			clearHref: '?',
		});
		expect(html).toContain('<div>Lisbon card</div>');
		expect(html).toMatch(/<a [^>]*href="\?">Clear all<\/a>/);
	});

	describe('Filter groups', () => {
		it('renders one disclosure per group, labelled with the group heading', () => {
			const html = renderPool();
			expect(html).toMatch(/<summary[^>]*>.*?Country/);
			expect(html).toMatch(/<summary[^>]*>.*?Type of place/);
			expect(html.match(/<details /g)).toHaveLength(2);
		});

		it('shares one name across the disclosures so one panel opens at a time', () => {
			const html = renderPool();
			expect(disclosureFor(html, 'Country')).toContain('name="filters"');
			expect(disclosureFor(html, 'Type of place')).toContain('name="filters"');
		});

		it('shows no badge when nothing is selected', () => {
			expect(renderPool()).not.toContain('·');
		});

		it('shows the number of selected options in the trigger', () => {
			const html = renderPool({
				query: { attribute: ['city', 'history'], country: 'greece' },
			});
			const country = html.match(/<summary[^>]*>.*?Country.*?<\/summary>/)[0];
			const attributes = html.match(
				/<summary[^>]*>.*?Type of place.*?<\/summary>/,
			)[0];
			expect(country).toContain('· 1');
			expect(attributes).toContain('· 2');
		});

		it('lists checkboxes named country and attribute, valued from the Pool', () => {
			const html = renderPool();
			expect(html).toMatch(
				/<input [^>]*type="checkbox"[^>]*name="country"[^>]*value="portugal"[^>]*\/>/,
			);
			expect(html).toMatch(
				/<input [^>]*type="checkbox"[^>]*name="country"[^>]*value="greece"/,
			);
			expect(html).toMatch(
				/<input [^>]*type="checkbox"[^>]*name="attribute"[^>]*value="history"/,
			);
			expect(html).toMatch(/<label[^>]*>.*?Portugal<\/label>/);
		});

		it('ticks the checkboxes that match the visitor choices', () => {
			const html = renderPool({ query: { country: 'greece' } });
			expect(html).toMatch(/<input [^>]*checked=""[^>]*value="greece"/);
			expect(html).not.toMatch(/<input [^>]*checked=""[^>]*value="portugal"/);
		});

		it('ticks the checkboxes in the browser render too', () => {
			const html = renderPool({ query: { country: 'greece' }, handlers });
			expect(html).toMatch(/<input [^>]*checked=""[^>]*value="greece"/);
			expect(html).not.toMatch(/<input [^>]*checked=""[^>]*value="portugal"/);
		});

		it('keeps the checkboxes inside the search form', () => {
			const html = renderPool();
			const form = html.match(/<form [^>]*role="search"[^>]*>.*<\/form>/)[0];
			expect(form).toContain('name="q"');
			expect(form).toContain('type="checkbox"');
			expect(form).toContain('name="country"');
		});

		it('shows a group with a single option', () => {
			const html = renderPool({ query: undefined, handlers });
			expect(html).toContain('Type of place');
			const choices = parseChoices();
			const single = render({
				result: searchDestinations({
					destinations: [lisbon],
					choices,
					labels,
				}),
				choices,
			});
			expect(single).toMatch(/<summary[^>]*>.*?Country/);
			expect(single).toContain('value="portugal"');
		});

		it('renders no trigger for a group without options', () => {
			const choices = parseChoices();
			const html = render({
				result: searchDestinations({
					destinations: [{ ...lisbon, attributes: [] }],
					choices,
					labels,
				}),
				choices,
			});
			expect(html).toMatch(/<summary[^>]*>.*?Country/);
			expect(html).not.toContain('Type of place');
			expect(html.match(/<details /g)).toHaveLength(1);
		});
	});

	describe('Clear in the panel footer', () => {
		// The panel of the <details> whose summary shows `heading`.
		const panelFor = (html, heading) =>
			html.match(
				new RegExp(`<details [^>]*><summary[^>]*>.*?${heading}.*?</details>`),
			)[0];

		it('shows a Clear button with the editor label in each panel', () => {
			const html = renderPool({ handlers });
			for (const heading of ['Country', 'Type of place']) {
				expect(panelFor(html, heading)).toMatch(
					/<button type="button" [^>]*>Clear<\/button>/,
				);
			}
		});

		it('uses the editor label instead of a default', () => {
			const html = renderPool({
				handlers,
				texts: { ...texts, clearGroupLabel: 'Reset' },
			});
			expect(panelFor(html, 'Country')).toContain('>Reset</button>');
			expect(panelFor(html, 'Country')).not.toContain('>Clear</button>');
		});

		it('keeps Clear all in the controls row apart from the panel Clear', () => {
			const html = renderPool({ handlers });
			expect(panelFor(html, 'Country')).not.toContain('Clear all');
		});
	});

	describe('Done in the panel footer on a phone', () => {
		const panelFor = (html, heading) =>
			html.match(
				new RegExp(`<details [^>]*><summary[^>]*>.*?${heading}.*?</details>`),
			)[0];
		const doneButtonIn = (panel) =>
			panel.match(/<button type="button" ([^>]*)>(Done|Finish)<\/button>/);

		it('shows a Done button in each panel', () => {
			const html = renderPool({ handlers });
			for (const heading of ['Country', 'Type of place']) {
				expect(doneButtonIn(panelFor(html, heading))?.[2]).toBe('Done');
			}
		});

		it('uses the editor label instead of the default', () => {
			const html = renderPool({
				handlers,
				texts: { ...texts, doneLabel: 'Finish' },
			});
			expect(doneButtonIn(panelFor(html, 'Country'))?.[2]).toBe('Finish');
			expect(panelFor(html, 'Country')).not.toContain('>Done</button>');
		});

		it('hides Done from the sm breakpoint up', () => {
			const html = renderPool({ handlers });
			expect(doneButtonIn(panelFor(html, 'Country'))[1]).toContain(
				'sm:hidden',
			);
		});

		it('keeps Done in the server render too', () => {
			expect(doneButtonIn(panelFor(renderPool(), 'Country'))?.[2]).toBe(
				'Done',
			);
		});
	});

	describe('phone panel layout', () => {
		it('makes the search box full width and the panel span the controls row below it', () => {
			const html = renderPool({ handlers });
			expect(html).toMatch(/<input type="search"[^>]* class="w-full /);
			const panel = html.match(/<div class="([^"]*)" role="group"/)[1];
			expect(panel).toContain('inset-x-0');
			expect(panel).toContain('top-full');
		});

		it('uses 16px row text and 18px checkboxes below sm', () => {
			const html = renderPool({ handlers });
			expect(html).toMatch(/<label [^>]*class="[^"]*text-base [^"]*sm:text-sm/);
			expect(html).toMatch(/<input type="checkbox"[^>]*size-4\.5 [^"]*sm:size-4/);
		});
	});

	describe('controls row', () => {
		it('shows Clear all as a link when there are no choices on the server', () => {
			const html = renderPool({ clearHref: '?_storyblok=1' });
			expect(html).toMatch(/<a [^>]*href="\?_storyblok=1">Clear all<\/a>/);
		});

		it('shows Clear all as a link when there are choices on the server', () => {
			const html = renderPool({ query: { country: 'greece' } });
			expect(html).toMatch(/<a [^>]*href="\?">Clear all<\/a>/);
		});

		it('shows Clear all as a button in the browser', () => {
			const html = renderPool({ handlers });
			expect(html).toMatch(/<button type="button" [^>]*>Clear all<\/button>/);
			expect(html).not.toContain('>Clear all</a>');
		});

		it('lists the search box, both triggers and Clear all in one row, in that order', () => {
			const form = renderPool().match(/<form [^>]*>.*<\/form>/)[0];
			const positions = [
				form.indexOf('type="search"'),
				form.indexOf('Country</span>'),
				form.indexOf('Type of place</span>'),
				form.indexOf('>Clear all</a>'),
			];
			expect(positions.every((position) => position >= 0)).toBe(true);
			expect(positions).toEqual(
				[...positions].sort((first, second) => first - second),
			);
		});
	});
});
