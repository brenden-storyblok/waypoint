import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import DestinationGallery from './DestinationGallery';

const blok = { _uid: 'gallery-uid', component: 'destination_gallery' };

const asset = (name, size) => ({
	id: name,
	filename: `https://a.storyblok.com/f/1/${name}.jpg`,
	meta_data: { size },
});

const tileClasses = (html) =>
	[...html.matchAll(/<div class="([^"]*)"><img/g)].map((match) =>
		match[1].split(' '),
	);

describe('DestinationGallery', () => {
	it('renders nothing without a destination', () => {
		expect(renderToStaticMarkup(<DestinationGallery blok={blok} />)).toBe('');
	});

	// A lone square can only fill its rows by spanning the whole grid: four
	// columns from md, both columns below it, two rows at each width.
	it('spans a lone tile across the full grid at both widths', () => {
		const html = renderToStaticMarkup(
			<DestinationGallery
				blok={blok}
				destination={{ gallery: [asset('square', '1000x1000')] }}
			/>,
		);
		const [tile] = tileClasses(html);
		expect(tile).toEqual(
			expect.arrayContaining([
				'col-span-2',
				'row-span-2',
				'md:col-span-4',
				'md:row-span-2',
			]),
		);
	});

	// Four landscapes fill one wide row and two narrow rows as single cells.
	it('gives four landscape images one cell each', () => {
		const html = renderToStaticMarkup(
			<DestinationGallery
				blok={blok}
				destination={{
					gallery: ['one', 'two', 'three', 'four'].map((name) =>
						asset(name, '1600x900'),
					),
				}}
			/>,
		);
		const tiles = tileClasses(html);
		expect(tiles).toHaveLength(4);
		for (const tile of tiles) {
			expect(tile).toEqual(
				expect.arrayContaining([
					'col-span-1',
					'row-span-1',
					'md:col-span-1',
					'md:row-span-1',
				]),
			);
		}
	});

	it('counts the images', () => {
		const html = renderToStaticMarkup(
			<DestinationGallery
				blok={blok}
				destination={{ gallery: [asset('square', '1000x1000')] }}
			/>,
		);
		expect(html).toContain('>1 image</span>');
	});
});
