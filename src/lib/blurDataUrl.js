import { PASSTHROUGH_EXTENSION, storyblokImageUrl } from './images';

const BLUR_WIDTH = 16;
// A published page fetches each placeholder once a day at most.
const REVALIDATE_SECONDS = 60 * 60 * 24;
// A slow Image Service must not hold up the page; the hero renders without a blur.
const TIMEOUT_MS = 3000;

/**
 * Fetches a 16px-wide version of a Storyblok asset and returns it as a base64
 * data URI for `next/image`'s `blurDataURL`. Takes the asset and crop that
 * `StoryblokImage` takes, so the placeholder matches the full image. Returns
 * `undefined` for an asset without a filename, for SVG and GIF files, and when
 * the fetch fails or times out.
 */
export async function blurDataUrl(asset, { crop } = {}) {
	if (!asset?.filename || PASSTHROUGH_EXTENSION.test(asset.filename)) return;
	try {
		const response = await fetch(
			storyblokImageUrl(asset, { width: BLUR_WIDTH, crop }),
			{
				next: { revalidate: REVALIDATE_SECONDS },
				signal: AbortSignal.timeout(TIMEOUT_MS),
			},
		);
		if (!response.ok) return;
		const contentType = response.headers.get('content-type') ?? 'image/jpeg';
		const bytes = Buffer.from(await response.arrayBuffer());
		return `data:${contentType};base64,${bytes.toString('base64')}`;
	} catch {
		return;
	}
}
