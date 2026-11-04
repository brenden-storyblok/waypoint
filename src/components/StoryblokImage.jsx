'use client';

import Image from 'next/image';
import { PASSTHROUGH_EXTENSION, storyblokImageUrl } from '@/lib/images';

/**
 * Builds a loader that turns a width into a Storyblok Image Service URL for
 * one asset.
 */
const storyblokLoader =
	(asset, crop) =>
	({ width, quality }) =>
		storyblokImageUrl(asset, { width, crop, quality });

/**
 * A Storyblok asset rendered with `next/image`. Owns `src` and `loader`, so
 * Storyblok's CDN does all the resizing. `crop` is a "W:H" ratio; when set,
 * the component's aspect class must agree with it. SVG and GIF files render
 * unoptimized from their original URL. A `blurDataURL` turns on the blur
 * placeholder, which `next/image` removes once the photo loads.
 */
const StoryblokImage = ({ asset, crop, alt, blurDataURL, ...imageProps }) => {
	if (!asset?.filename) return null;
	return (
		<Image
			{...imageProps}
			src={asset.filename}
			alt={alt ?? asset.alt ?? ''}
			loader={storyblokLoader(asset, crop)}
			unoptimized={PASSTHROUGH_EXTENSION.test(asset.filename)}
			{...(blurDataURL && { placeholder: 'blur', blurDataURL })}
		/>
	);
};

export default StoryblokImage;
