// Storybook swaps this in for ../fetchBlurDataUrl.js (see sb.mock in
// .storybook/preview.jsx). The real utility needs Node's Buffer and a
// cross-origin fetch, so the browser gets a fixed blue-grey pixel instead.
import { PASSTHROUGH_EXTENSION } from '@/lib/images';

const BLUR_PIXEL =
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

export async function fetchBlurDataUrl(asset) {
	if (!asset?.filename || PASSTHROUGH_EXTENSION.test(asset.filename)) return;
	return BLUR_PIXEL;
}
