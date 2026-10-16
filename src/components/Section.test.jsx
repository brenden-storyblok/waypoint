import { describe, expect, it } from 'vitest';
import { Children, isValidElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { getComponent, StoryblokServerComponent } from '@storyblok/react/rsc';
import '@/lib/storyblok';
import Section from '@/components/Section';

/**
 * The props a rendered element tree hands to the component registry, one
 * entry per nested block, in render order.
 */
const registryHandoffs = (element) => {
	if (!isValidElement(element)) return [];
	if (element.type === StoryblokServerComponent) return [element.props];
	return Children.toArray(element.props.children).flatMap(registryHandoffs);
};

const sectionBlok = (fields = {}) => ({
	_uid: 'section-uid',
	component: 'section',
	body: [],
	...fields,
});

/**
 * The class lists of every `tagName` element in the markup, in document order.
 */
const classListsOf = (html, tagName) =>
	[...html.matchAll(new RegExp(`<${tagName}\\b[^>]*>`, 'g'))].map(
		([openingTag]) => openingTag.match(/class="([^"]*)"/)?.[1].split(' ') ?? [],
	);

const renderSection = (fields) =>
	renderToStaticMarkup(<Section blok={sectionBlok(fields)} />);

const sectionClasses = (fields) =>
	classListsOf(renderSection(fields), 'section')[0];
const innerClasses = (fields) => classListsOf(renderSection(fields), 'div')[0];
const bodyClasses = (fields) => classListsOf(renderSection(fields), 'div')[1];
const headlineClasses = (fields) =>
	classListsOf(renderSection(fields), 'h2')[0];

const contentWidth = ['mx-auto', 'max-w-7xl', 'px-gutter'];
const splitColumns = 'md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]';
const swappedColumns = 'md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]';

describe('Section', () => {
	it.each([
		['none', ['py-0']],
		['compact', ['py-9']],
		['default', ['py-18']],
		['spacious', ['py-27']],
	])('sets %s padding', (padding, expectedClasses) => {
		expect(sectionClasses({ padding })).toEqual(
			expect.arrayContaining(expectedClasses),
		);
	});

	it('uses default padding when the editor left it empty or picked an unknown one', () => {
		for (const padding of [undefined, '', 'huge']) {
			expect(sectionClasses({ padding })).toContain('py-18');
		}
	});

	it.each([
		['surface', ['bg-white', 'dark:bg-deep-sea-800']],
		[
			'inverse',
			[
				'bg-deep-sea-900',
				'text-frost-100',
				'dark:bg-frost-200',
				'dark:text-deep-sea-950',
			],
		],
		[
			'accent',
			[
				'bg-lagoon-700',
				'text-white',
				'dark:bg-lagoon-300',
				'dark:text-deep-sea-950',
			],
		],
	])(
		'sets the %s background in light and dark mode',
		(background, expectedClasses) => {
			expect(sectionClasses({ background })).toEqual(
				expect.arrayContaining(expectedClasses),
			);
		},
	);

	it('sets no background when the editor left it empty or picked an unknown one', () => {
		for (const background of ['', 'neon']) {
			const classes = sectionClasses({ background });
			expect(classes.filter((name) => /^(dark:)?bg-/.test(name))).toEqual([]);
		}
	});

	it('keeps its content at content width by default', () => {
		expect(innerClasses()).toEqual(expect.arrayContaining(contentWidth));
	});

	it('spans its content across the viewport when full bleed is on', () => {
		const classes = innerClasses({ full_bleed: true });
		expect(classes).not.toContain('max-w-7xl');
		expect(classes).not.toContain('px-gutter');
	});

	it('keeps the headline at content width when full bleed is on', () => {
		expect(
			headlineClasses({ full_bleed: true, headline: 'Plan your trip' }),
		).toEqual(expect.arrayContaining(contentWidth));
	});

	it('shows the headline as a heavy display heading', () => {
		const html = renderSection({ headline: 'Plan your trip' });
		expect(html).toContain('>Plan your trip</h2>');
		expect(classListsOf(html, 'h2')[0]).toEqual(
			expect.arrayContaining([
				'font-display',
				'text-display',
				'font-extrabold',
				'text-balance',
			]),
		);
	});

	it.each(['start', 'end'])(
		'puts a %s headline beside the body, stacked below md and split from md',
		(headlinePosition) => {
			const fields = {
				headline: 'Need more ideas?',
				headline_position: headlinePosition,
			};
			const classes = innerClasses(fields);
			expect(classes).toEqual(
				expect.arrayContaining(['grid', 'grid-cols-1', ...contentWidth]),
			);
			expect(
				classes.filter((name) => name.startsWith('md:grid-cols-')),
			).toHaveLength(1);
		},
	);

	it('splits a start headline 1fr/2fr with the headline on the left', () => {
		expect(
			innerClasses({
				headline: 'Need more ideas?',
				headline_position: 'start',
			}),
		).toContain(splitColumns);
	});

	it('keeps an end headline first in the markup but moves it to the right column from md', () => {
		const fields = { headline: 'Need more ideas?', headline_position: 'end' };
		const html = renderSection(fields);
		expect(html.indexOf('<h2')).toBeLessThan(html.lastIndexOf('<div'));
		expect(innerClasses(fields)).toContain(swappedColumns);
		expect(headlineClasses(fields)).toEqual(
			expect.arrayContaining(['md:col-start-2', 'md:row-start-1']),
		);
		expect(bodyClasses(fields)).toEqual(
			expect.arrayContaining(['md:col-start-1', 'md:row-start-1']),
		);
	});

	it('keeps a start headline and its body at content width when full bleed is on', () => {
		expect(
			innerClasses({
				full_bleed: true,
				headline: 'Need more ideas?',
				headline_position: 'start',
			}),
		).toEqual(expect.arrayContaining([...contentWidth, splitColumns]));
	});

	it('stacks the headline above the body for an empty or unknown headline position', () => {
		for (const headlinePosition of ['', 'side']) {
			const classes = innerClasses({
				headline: 'Plan your trip',
				headline_position: headlinePosition,
			});
			expect(
				classes.filter((name) => name.startsWith('md:grid-cols-')),
			).toEqual([]);
		}
	});

	it('renders its Buttons through the component registry', () => {
		const html = renderSection({
			body: [
				{
					_uid: 'button-uid',
					component: 'button',
					label: 'Book now',
					variant: 'primary',
					link: { linktype: 'url', url: 'https://example.com/book' },
				},
			],
		});
		expect(html).toMatch(
			/<a [^>]*href="https:\/\/example.com\/book"[^>]*>Book now<\/a>/,
		);
	});

	it("forwards the page's Destination to its children", () => {
		const lisbon = { name: 'Lisbon' };
		const html = renderToStaticMarkup(
			<Section
				blok={sectionBlok({
					body: [
						{
							_uid: 'bio-uid',
							component: 'destination_bio',
							headline: 'About Lisbon',
						},
					],
				})}
				destination={lisbon}
				searchParams={{ country: 'portugal' }}
			/>,
		);
		expect(html).toMatch(/<h2[^>]*>About Lisbon<\/h2>/);
	});

	// Only the Destination Grid reads searchParams, and on the server its
	// client search renders in place of the URL-driven fallback, so no markup
	// shows them. This follows the handoff instead: Section to the registry's
	// real Layout, and that Layout on to the Destination Grid.
	it("forwards the page's search params through a nested Layout to its Destination Grid", () => {
		const searchParams = { q: 'lisbon', country: 'portugal' };
		const sectionElement = Section({
			blok: sectionBlok({
				body: [
					{
						_uid: 'layout-uid',
						component: 'layout',
						items: [
							{
								_uid: 'grid-uid',
								component: 'destination_grid',
								search_enabled: true,
							},
						],
					},
				],
			}),
			searchParams,
		});

		const [layoutHandoff] = registryHandoffs(sectionElement);
		expect(layoutHandoff.blok.component).toBe('layout');
		expect(layoutHandoff.searchParams).toBe(searchParams);

		const RegisteredLayout = getComponent(layoutHandoff.blok.component);
		const [gridHandoff] = registryHandoffs(RegisteredLayout(layoutHandoff));
		expect(gridHandoff.blok.component).toBe('destination_grid');
		expect(gridHandoff.searchParams).toBe(searchParams);
	});
});
