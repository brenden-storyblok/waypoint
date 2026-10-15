import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import '@/lib/storyblok';
import Section from '@/components/Section';

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
				'</section>'
		);
	});

	it.each(['none', 'compact', 'default', 'spacious'])(
		'sets %s padding',
		(padding) => {
			const html = renderToStaticMarkup(
				<Section blok={sectionBlok({ padding })} />
			);
			expect(html).toContain(`class="section section--pad-${padding}"`);
		}
	);

	it('falls back to default padding for an unknown value', () => {
		const html = renderToStaticMarkup(
			<Section blok={sectionBlok({ padding: 'huge' })} />
		);
		expect(html).toContain('class="section section--pad-default"');
	});

	it.each(['surface', 'inverse', 'accent'])(
		'sets the %s background',
		(background) => {
			const html = renderToStaticMarkup(
				<Section blok={sectionBlok({ background })} />
			);
			expect(html).toContain(
				`class="section section--bg-${background} section--pad-default"`
			);
		}
	);

	it('sets no background when the editor left it empty or picked an unknown one', () => {
		for (const background of ['', 'neon']) {
			const html = renderToStaticMarkup(
				<Section blok={sectionBlok({ background })} />
			);
			expect(html).toContain('class="section section--pad-default"');
		}
	});

	it('spans its content across the viewport when full bleed is on', () => {
		const html = renderToStaticMarkup(
			<Section blok={sectionBlok({ full_bleed: true })} />
		);
		expect(html).toBe(
			'<section class="section section--full-bleed section--pad-default">' +
				'<div class="section__inner"></div>' +
				'</section>'
		);
	});

	it('shows the headline in the section title style', () => {
		const html = renderToStaticMarkup(
			<Section blok={sectionBlok({ headline: 'Plan your trip' })} />
		);
		expect(html).toBe(
			'<section class="section section--pad-default">' +
				'<div class="section__inner wp-wrap">' +
				'<h2 class="section__headline wp-section-title">Plan your trip</h2>' +
				'</div>' +
				'</section>'
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
			/>
		);
		expect(html).toContain(
			'<a class="btn btn--primary" href="https://example.com/book">Book now</a>'
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
			/>
		);
		expect(html).toContain(
			'<h2 class="wp-section-title">About Lisbon</h2>'
		);
	});
});
