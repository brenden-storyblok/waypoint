import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import '@/lib/storyblok';
import Layout from '@/components/Layout';

const layoutBlok = (fields = {}) => ({
	_uid: 'layout-uid',
	component: 'layout',
	items: [],
	...fields,
});

const freshGridStyle =
	'--layout-columns:1;--layout-columns-md:1;--layout-columns-lg:1;--layout-columns-xl:1;' +
	'--layout-align:stretch;--layout-align-md:stretch;--layout-align-lg:stretch;--layout-align-xl:stretch;' +
	'--layout-gap:var(--space-md);--layout-gap-md:var(--space-md);--layout-gap-lg:var(--space-md);--layout-gap-xl:var(--space-md)';

describe('Layout', () => {
	it('renders a fresh Layout as a 1-column grid with the md gap', () => {
		const html = renderToStaticMarkup(
			<Layout blok={layoutBlok({ mode: 'grid' })} />
		);
		expect(html).toBe(
			`<div class="layout layout--grid" style="${freshGridStyle}"></div>`
		);
	});

	it('fills every Breakpoint with the Base values', () => {
		const html = renderToStaticMarkup(
			<Layout
				blok={layoutBlok({
					mode: 'grid',
					grid_columns: '2',
					grid_align: 'center',
					gap: 'lg',
				})}
			/>
		);
		expect(html).toContain(
			'style="--layout-columns:2;--layout-columns-md:2;--layout-columns-lg:2;--layout-columns-xl:2;' +
				'--layout-align:center;--layout-align-md:center;--layout-align-lg:center;--layout-align-xl:center;' +
				'--layout-gap:var(--space-lg);--layout-gap-md:var(--space-lg);--layout-gap-lg:var(--space-lg);--layout-gap-xl:var(--space-lg)"'
		);
	});

	it('lets an empty md inherit Base and carries an lg value through to xl', () => {
		const html = renderToStaticMarkup(
			<Layout
				blok={layoutBlok({
					mode: 'grid',
					grid_columns: '1',
					grid_columns_md: '',
					grid_columns_lg: '3',
					grid_columns_xl: '',
				})}
			/>
		);
		expect(html).toContain(
			'--layout-columns:1;--layout-columns-md:1;--layout-columns-lg:3;--layout-columns-xl:3;'
		);
	});

	it.each([
		['none', '0'],
		['xs', 'var(--space-xs)'],
		['sm', 'var(--space-sm)'],
		['md', 'var(--space-md)'],
		['lg', 'var(--space-lg)'],
		['xl', 'var(--space-xl)'],
	])('maps the %s gap to %s', (gap, cssValue) => {
		const html = renderToStaticMarkup(
			<Layout blok={layoutBlok({ gap_xl: gap })} />
		);
		expect(html).toContain(`--layout-gap-xl:${cssValue}"`);
	});

	it('falls back to grid for an empty or unknown mode', () => {
		for (const mode of [undefined, '', 'masonry']) {
			const html = renderToStaticMarkup(<Layout blok={layoutBlok({ mode })} />);
			expect(html).toBe(
				`<div class="layout layout--grid" style="${freshGridStyle}"></div>`
			);
		}
	});

	it('leaves the grid settings out in flex mode', () => {
		const html = renderToStaticMarkup(
			<Layout blok={layoutBlok({ mode: 'flex', grid_columns: '3' })} />
		);
		expect(html).toBe(
			'<div class="layout layout--flex" style="' +
				'--layout-gap:var(--space-md);--layout-gap-md:var(--space-md);--layout-gap-lg:var(--space-md);--layout-gap-xl:var(--space-md)' +
				'"></div>'
		);
	});

	it('gives a nested Layout its own full set of properties', () => {
		const html = renderToStaticMarkup(
			<Layout
				blok={layoutBlok({
					grid_columns_lg: '3',
					items: [
						{
							_uid: 'nested-layout-uid',
							component: 'layout',
							mode: 'grid',
							items: [],
						},
					],
				})}
			/>
		);
		expect(html).toContain(
			`<div class="layout layout--grid" style="${freshGridStyle}"></div></div>`
		);
	});

	it("forwards the page's Destination to its children", () => {
		const lisbon = { name: 'Lisbon' };
		const html = renderToStaticMarkup(
			<Layout
				blok={layoutBlok({
					items: [
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
		expect(html).toContain('<h2 class="wp-section-title">About Lisbon</h2>');
	});
});
