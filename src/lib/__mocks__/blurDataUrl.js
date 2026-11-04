// Storybook swaps this in for ../blurDataUrl.js (see sb.mock in
// .storybook/preview.jsx). The real utility needs Node's Buffer and a
// cross-origin fetch, so the browser gets a fixed blue-grey pixel instead.
const BLUR_PIXEL =
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

export async function blurDataUrl(asset) {
	return asset?.filename ? BLUR_PIXEL : undefined;
}
