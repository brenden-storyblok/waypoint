/**
 * The request header the proxy sets for the draft route: the page the editor
 * asked for. A rewrite drops query params the proxy adds, so a header carries it.
 */
export const DRAFT_PATH_HEADER = 'x-draft-path';

/** The Visual Editor's signed-token params; the draft route verifies and strips them. */
export const PREVIEW_TOKEN_PREFIX = '_storyblok_tk';

/** Whether the query carries the Visual Editor's `_storyblok_tk` params. */
export const hasPreviewParams = (searchParams) =>
	[...searchParams.keys()].some((name) =>
		name.startsWith(PREVIEW_TOKEN_PREFIX),
	);
