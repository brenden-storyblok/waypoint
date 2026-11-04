import { storyblokEditable } from '@storyblok/react/rsc';
import { bentoLayout } from '@/lib/bento';
import ImageCredit from './ImageCredit';
import StoryblokImage from './StoryblokImage';

// Literal span classes so Tailwind generates each one bentoLayout can return.
// Below md the gallery has 2 columns (narrow spans); from md it has 4 (wide spans).
const NARROW_COLS = { 1: 'col-span-1', 2: 'col-span-2' };
const NARROW_ROWS = { 1: 'row-span-1', 2: 'row-span-2' };
const WIDE_COLS = {
	1: 'md:col-span-1',
	2: 'md:col-span-2',
	3: 'md:col-span-3',
	4: 'md:col-span-4',
};
const WIDE_ROWS = { 1: 'md:row-span-1', 2: 'md:row-span-2' };

const tileSpans = ({ wide, narrow }) =>
	[
		NARROW_COLS[narrow.cols],
		NARROW_ROWS[narrow.rows],
		WIDE_COLS[wide.cols],
		WIDE_ROWS[wide.rows],
	]
		.filter(Boolean)
		.join(' ');

// The image width a tile needs, from the columns it spans. Below md the grid
// has 2 columns, so a span is a share of the viewport. From md it has 4, each
// about a quarter of the viewport. Past xl the container stops at 1184px: four
// columns of 287px with 12px gaps, so a span of n columns is 299n - 12 pixels.
const NARROW_COLUMNS = 2;
const WIDE_COLUMNS = 4;
const MAX_COLUMN_PX = 287;
const GAP_PX = 12;

const tileSizes = ({ wide, narrow }) => {
	const maxWidth = wide.cols * (MAX_COLUMN_PX + GAP_PX) - GAP_PX;
	const wideShare = (wide.cols / WIDE_COLUMNS) * 100;
	const narrowShare = (narrow.cols / NARROW_COLUMNS) * 100;
	return `(min-width: 1280px) ${maxWidth}px, (min-width: 768px) ${wideShare}vw, ${narrowShare}vw`;
};

const DestinationGallery = ({ blok, destination }) => {
	if (!destination) return null;

	const images = (destination.gallery ?? []).filter((asset) => asset?.filename);

	return (
		<section {...storyblokEditable(blok)} className="py-18">
			<div className="mx-auto max-w-7xl px-gutter">
				<div className="mb-8 flex flex-wrap items-end justify-between gap-4">
					{blok.headline && (
						<h2 className="font-display text-display leading-[1.05] font-extrabold tracking-[-0.01em] text-balance">
							{blok.headline}
						</h2>
					)}
					{images.length > 0 && (
						<span className="font-mono text-xs text-slate-500 dark:text-slate-300">
							{images.length} {images.length === 1 ? 'image' : 'images'}
						</span>
					)}
				</div>
				<div className="grid grid-flow-dense auto-rows-gallery-row grid-cols-2 gap-3 md:grid-cols-4">
					{bentoLayout(images).map((tile) => (
						<div
							key={tile.asset.id ?? tile.asset.filename}
							className={`relative min-h-0 min-w-0 ${tileSpans(tile)}`}
						>
							<StoryblokImage
								asset={tile.asset}
								fill
								sizes={tileSizes(tile)}
								className="rounded-md bg-placeholder object-cover"
							/>
							<ImageCredit asset={tile.asset} />
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

export default DestinationGallery;
