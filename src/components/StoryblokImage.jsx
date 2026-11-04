'use client';

import Image from 'next/image';

const DEFAULT_QUALITY = 75;
const PASSTHROUGH_EXTENSION = /\.(svg|gif)$/i;

/** Height for a width at a "W:H" ratio. */
const cropHeight = (width, crop) => {
	const [ratioWidth, ratioHeight] = crop.split(':').map(Number);
	return Math.round((width * ratioHeight) / ratioWidth);
};

/**
 * Builds a loader that turns a width into a Storyblok Image Service URL for
 * one asset. A crop keeps the Focus Point in frame, or falls back to `/smart`.
 */
const storyblokLoader =
	(asset, crop) =>
	({ src, width, quality }) => {
		const height = crop ? cropHeight(width, crop) : 0;
		const filters = [];
		if (crop && asset.focus) filters.push(`focal(${asset.focus})`);
		filters.push(`quality(${quality ?? DEFAULT_QUALITY})`);
		const smart = crop && !asset.focus ? '/smart' : '';
		return `${src}/m/${width}x${height}${smart}/filters:${filters.join(':')}`;
	};

/**
 * A Storyblok asset rendered with `next/image`. Owns `src` and `loader`, so
 * Storyblok's CDN does all the resizing. `crop` is a "W:H" ratio; when set,
 * the component's aspect class must agree with it. SVG and GIF files render
 * unoptimized from their original URL.
 */
const StoryblokImage = ({ asset, crop, alt, ...imageProps }) => {
	if (!asset?.filename) return null;
	return (
		<Image
			{...imageProps}
			src={asset.filename}
			alt={alt ?? asset.alt ?? ''}
			loader={storyblokLoader(asset, crop)}
			unoptimized={PASSTHROUGH_EXTENSION.test(asset.filename)}
		/>
	);
};

export default StoryblokImage;
