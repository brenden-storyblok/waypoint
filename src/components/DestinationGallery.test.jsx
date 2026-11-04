import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import DestinationGallery from './DestinationGallery';
import { firstImage } from '@/test/firstImage';

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

describe('DestinationGallery images', () => {
	const renderGallery = (gallery) =>
		renderToStaticMarkup(
			<DestinationGallery blok={blok} destination={{ gallery }} />,
		);

	it('serves each photo uncropped through the Storyblok image service', () => {
		const image = firstImage(renderGallery([asset('square', '1000x1000')]));
		expect(image).toContain(
			'src="https://a.storyblok.com/f/1/square.jpg/m/3840x0/filters:quality(75)"',
		);
		expect(image).not.toContain('/smart');
		expect(image).not.toContain('focal(');
	});

	it('loads photos lazily and fills the tile', () => {
		const image = firstImage(renderGallery([asset('square', '1000x1000')]));
		expect(image).toContain('loading="lazy"');
		expect(image).toContain('data-nimg="fill"');
	});

	// A full-width tile needs the whole row at every width.
	it('sizes a full-grid tile to the viewport', () => {
		const image = firstImage(renderGallery([asset('square', '1000x1000')]));
		expect(image).toContain(
			'sizes="(min-width: 1280px) 1184px, (min-width: 768px) 100vw, 100vw"',
		);
	});

	// A one-cell tile is half the row below md and a quarter of it from md.
	it('sizes a one-cell tile to its column', () => {
		const html = renderGallery(
			['one', 'two', 'three', 'four'].map((name) => asset(name, '1600x900')),
		);
		expect(firstImage(html)).toContain(
			'sizes="(min-width: 1280px) 287px, (min-width: 768px) 25vw, 50vw"',
		);
	});
});
