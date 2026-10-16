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

/** The class list of the outermost Layout element. */
const layoutClasses = (blok) => {
	const html = renderToStaticMarkup(<Layout blok={blok} />);
	const classAttribute = html.match(/^<div[^>]*\bclass="([^"]*)"/)?.[1] ?? '';
	return classAttribute.split(/\s+/).filter(Boolean);
};

describe('Layout', () => {
	it.each([
		['grid_columns', '3', 'grid-cols-3'],
		['grid_columns_md', '3', 'md:grid-cols-3'],
		['grid_columns_lg', '5', 'lg:grid-cols-5'],
		['grid_columns_xl', '6', 'xl:grid-cols-6'],
	])('renders %s: %s as %s', (field, editorValue, expectedClass) => {
		expect(
			layoutClasses(layoutBlok({ mode: 'grid', [field]: editorValue })),
		).toContain(expectedClass);
	});

	it('renders no lg: class for a setting left empty at lg', () => {
		const classes = layoutClasses(
			layoutBlok({ mode: 'grid', grid_columns: '2', grid_columns_lg: '' }),
		);
		expect(classes).toContain('grid-cols-2');
		expect(classes.filter((className) => className.startsWith('lg:'))).toEqual(
			[],
		);
	});

	it('renders a fresh Layout as a 1-column grid with the md gap', () => {
		const classes = layoutClasses(layoutBlok({ mode: 'grid' }));
		expect(classes).toEqual(
			expect.arrayContaining(['grid', 'grid-cols-1', 'items-stretch', 'gap-6']),
		);
		expect(classes.some((className) => className.includes(':'))).toBe(false);
	});

	it('falls back to grid for an empty or unknown mode', () => {
		for (const mode of [undefined, '', 'masonry']) {
			const classes = layoutClasses(layoutBlok({ mode }));
			expect(classes).toContain('grid');
			expect(classes).not.toContain('flex');
		}
	});

	it('falls back at Base and emits nothing at a Breakpoint for unknown values', () => {
		const classes = layoutClasses(
			layoutBlok({
				mode: 'grid',
				grid_columns: '9',
				grid_columns_md: 'many',
				grid_align: 'sideways',
				gap: 'huge',
				gap_xl: 'huge',
			}),
		);
		expect(classes).toEqual(
			expect.arrayContaining(['grid-cols-1', 'items-stretch', 'gap-6']),
		);
		expect(classes.some((className) => className.includes(':'))).toBe(false);
	});

	it.each([
		['grid_align', 'center', 'items-center'],
		['grid_align_md', 'start', 'md:items-start'],
		['grid_align_xl', 'end', 'xl:items-end'],
		['grid_align_lg', 'stretch', 'lg:items-stretch'],
	])('renders %s: %s as %s', (field, editorValue, expectedClass) => {
		expect(
			layoutClasses(layoutBlok({ mode: 'grid', [field]: editorValue })),
		).toContain(expectedClass);
	});

	it.each([
		['none', 'gap-0'],
		['xs', 'gap-2'],
		['sm', 'gap-4'],
		['md', 'gap-6'],
		['lg', 'gap-10'],
		['xl', 'gap-16'],
	])('maps the %s gap to %s at every Breakpoint', (gap, gapClass) => {
		for (const mode of ['grid', 'flex']) {
			const classes = layoutClasses(
				layoutBlok({ mode, gap, gap_md: gap, gap_lg: gap, gap_xl: gap }),
			);
			expect(classes).toEqual(
				expect.arrayContaining([
					gapClass,
					`md:${gapClass}`,
					`lg:${gapClass}`,
					`xl:${gapClass}`,
				]),
			);
		}
	});

	it('renders a fresh flex Layout as a content-sized, non-wrapping row', () => {
		const classes = layoutClasses(layoutBlok({ mode: 'flex' }));
		expect(classes).toEqual(
			expect.arrayContaining([
				'flex',
				'flex-row',
				'flex-nowrap',
				'justify-start',
				'items-stretch',
				'*:flex-initial',
				'*:min-w-0',
				'gap-6',
			]),
		);
		expect(
			classes.filter((className) => /^(md|lg|xl):/.test(className)),
		).toEqual([]);
	});

	it.each([
		['flex_direction', 'column', 'flex-col'],
		['flex_direction_md', 'row', 'md:flex-row'],
		['flex_wrap', 'wrap', 'flex-wrap'],
		['flex_wrap_lg', 'nowrap', 'lg:flex-nowrap'],
		['flex_justify', 'center', 'justify-center'],
		['flex_justify_md', 'end', 'md:justify-end'],
		['flex_justify_lg', 'space-between', 'lg:justify-between'],
		['flex_justify_xl', 'space-around', 'xl:justify-around'],
		['flex_justify', 'space-evenly', 'justify-evenly'],
		['flex_justify_md', 'start', 'md:justify-start'],
		['flex_align', 'center', 'items-center'],
		['flex_align_md', 'start', 'md:items-start'],
		['flex_align_lg', 'end', 'lg:items-end'],
		['flex_align_xl', 'stretch', 'xl:items-stretch'],
		['flex_item_sizing', 'equal', '*:flex-1'],
		['flex_item_sizing_md', 'equal', 'md:*:flex-1'],
		['flex_item_sizing_xl', 'content', 'xl:*:flex-initial'],
	])('renders %s: %s as %s', (field, editorValue, expectedClass) => {
		expect(
			layoutClasses(layoutBlok({ mode: 'flex', [field]: editorValue })),
		).toContain(expectedClass);
	});

	it('ignores grid fields in flex mode', () => {
		const classes = layoutClasses(
			layoutBlok({ mode: 'flex', grid_columns: '3', grid_align_md: 'end' }),
		);
		expect(classes).not.toContain('grid-cols-3');
		expect(classes).not.toContain('md:items-end');
	});

	it('ignores flex fields in grid mode', () => {
		const classes = layoutClasses(
			layoutBlok({
				mode: 'grid',
				flex_direction: 'column',
				flex_item_sizing: 'equal',
			}),
		);
		expect(classes).not.toContain('flex-col');
		expect(classes).not.toContain('*:flex-1');
		expect(classes).not.toContain('*:min-w-0');
	});

	it('renders no inline style', () => {
		const html = renderToStaticMarkup(
			<Layout
				blok={layoutBlok({ mode: 'flex', gap_md: 'lg', flex_wrap: 'wrap' })}
			/>,
		);
		expect(html).not.toContain('style=');
	});

	it("renders only a nested Layout's own settings on it", () => {
		const html = renderToStaticMarkup(
			<Layout
				blok={layoutBlok({
					grid_columns_lg: '3',
					gap: 'xl',
					items: [
						{
							_uid: 'nested-layout-uid',
							component: 'layout',
							mode: 'grid',
							items: [],
						},
					],
				})}
			/>,
		);
		const nestedClasses = html
			.match(/<div[^>]*\bclass="([^"]*)"[^>]*><\/div><\/div>$/)?.[1]
			.split(' ');
		expect(nestedClasses).toEqual(
			expect.arrayContaining(['grid', 'grid-cols-1', 'gap-6']),
		);
		expect(nestedClasses).not.toContain('lg:grid-cols-3');
		expect(nestedClasses).not.toContain('gap-16');
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
			/>,
		);
		expect(html).toContain('About Lisbon');
	});
});
