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

describe('Section', () => {
	it('renders a default-padded band with its content in the content-width wrapper', () => {
		const html = renderToStaticMarkup(<Section blok={sectionBlok()} />);
		expect(html).toBe(
			'<section class="section section--pad-default">' +
				'<div class="section__inner wp-wrap"></div>' +
				'</section>',
		);
	});

	it.each(['none', 'compact', 'default', 'spacious'])(
		'sets %s padding',
		(padding) => {
			const html = renderToStaticMarkup(
				<Section blok={sectionBlok({ padding })} />,
			);
			expect(html).toContain(`class="section section--pad-${padding}"`);
		},
	);

	it('falls back to default padding for an unknown value', () => {
		const html = renderToStaticMarkup(
			<Section blok={sectionBlok({ padding: 'huge' })} />,
		);
		expect(html).toContain('class="section section--pad-default"');
	});

	it.each(['surface', 'inverse', 'accent'])(
		'sets the %s background',
		(background) => {
			const html = renderToStaticMarkup(
				<Section blok={sectionBlok({ background })} />,
			);
			expect(html).toContain(
				`class="section section--bg-${background} section--pad-default"`,
			);
		},
	);

	it('sets no background when the editor left it empty or picked an unknown one', () => {
		for (const background of ['', 'neon']) {
			const html = renderToStaticMarkup(
				<Section blok={sectionBlok({ background })} />,
			);
			expect(html).toContain('class="section section--pad-default"');
		}
	});

	it('spans its content across the viewport when full bleed is on', () => {
		const html = renderToStaticMarkup(
			<Section blok={sectionBlok({ full_bleed: true })} />,
		);
		expect(html).toBe(
			'<section class="section section--pad-default">' +
				'<div class="section__inner"></div>' +
				'</section>',
		);
	});

	it('keeps the headline at content width when full bleed is on', () => {
		const html = renderToStaticMarkup(
			<Section
				blok={sectionBlok({ full_bleed: true, headline: 'Plan your trip' })}
			/>,
		);
		expect(html).toBe(
			'<section class="section section--pad-default">' +
				'<div class="section__inner">' +
				'<h2 class="section__headline wp-section-title wp-wrap">Plan your trip</h2>' +
				'</div>' +
				'</section>',
		);
	});

	it('shows the headline in the section title style', () => {
		const html = renderToStaticMarkup(
			<Section blok={sectionBlok({ headline: 'Plan your trip' })} />,
		);
		expect(html).toBe(
			'<section class="section section--pad-default">' +
				'<div class="section__inner wp-wrap">' +
				'<h2 class="section__headline wp-section-title">Plan your trip</h2>' +
				'</div>' +
				'</section>',
		);
	});

	it('renders its Buttons through the component registry', () => {
		const html = renderToStaticMarkup(
			<Section
				blok={sectionBlok({
					body: [
						{
							_uid: 'button-uid',
							component: 'button',
							label: 'Book now',
							variant: 'primary',
							link: { linktype: 'url', url: 'https://example.com/book' },
						},
					],
				})}
			/>,
		);
		expect(html).toContain(
			'<a class="btn btn--primary" href="https://example.com/book">Book now</a>',
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
		expect(html).toContain('<h2 class="wp-section-title">About Lisbon</h2>');
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
