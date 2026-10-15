/**
 * Builds a Storyblok Image Service URL for an asset field value.
 * Pass 0 for one dimension to keep the aspect ratio.
 */
export function imageUrl(asset, width = 0, height = 0) {
	if (!asset?.filename) return null;
	if (!width && !height) return asset.filename;
	return `${asset.filename}/m/${width}x${height}/filters:format(webp)`;
}

export function imageAlt(asset) {
	return asset?.alt || '';
}
