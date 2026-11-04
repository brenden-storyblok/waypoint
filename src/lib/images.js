export function imageAlt(asset) {
	return asset?.alt || '';
}

export function imageCredit(asset) {
	return asset?.copyright?.trim() || '';
}

const DEFAULT_QUALITY = 75;

/** Matches the files the Image Service can't resize: SVG and GIF. */
export const PASSTHROUGH_EXTENSION = /\.(svg|gif)$/i;

/** Height for a width at a "W:H" ratio. */
const cropHeight = (width, crop) => {
	const [ratioWidth, ratioHeight] = crop.split(':').map(Number);
	return Math.round((width * ratioHeight) / ratioWidth);
};

/**
 * Builds a Storyblok Image Service URL for one asset. A crop keeps the Focus
 * Point in frame, or falls back to `/smart`. Without a crop the image keeps
 * its natural ratio.
 */
export function storyblokImageUrl(asset, { width, crop, quality }) {
	const height = crop ? cropHeight(width, crop) : 0;
	const filters = [];
	if (crop && asset.focus) filters.push(`focal(${asset.focus})`);
	filters.push(`quality(${quality ?? DEFAULT_QUALITY})`);
	const smart = crop && !asset.focus ? '/smart' : '';
	return `${asset.filename}/m/${width}x${height}${smart}/filters:${filters.join(':')}`;
}
