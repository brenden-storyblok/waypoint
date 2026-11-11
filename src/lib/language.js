/** Languages Waypoint serves; the first is the Default Language. */
export const LANGUAGES = [
	{ code: 'en', label: 'English' },
	{ code: 'de', label: 'Deutsch' },
	{ code: 'es', label: 'Español' },
	{ code: 'fr', label: 'Français' },
];

export const DEFAULT_LANGUAGE = LANGUAGES[0].code;

export const isLanguage = (code) =>
	LANGUAGES.some((language) => language.code === code);

const HOME_SLUG = 'home';

/**
 * The story slug for the segments of a request path (a catch-all route's
 * `slug` param): joined with `/`, or the home slug when there are none.
 */
export const slugFromSegments = (segments) =>
	segments?.length ? segments.join('/') : HOME_SLUG;

/**
 * Splits a request path into its Language and story slug. Only a known code
 * as the first segment is a prefix; anything else belongs to the slug of an
 * English page. `prefixed` tells the proxy whether the path carried a code.
 */
export function parsePath(pathname) {
	const segments = pathname.split('/').filter(Boolean);
	const prefixed = isLanguage(segments[0]);
	const language = prefixed ? segments.shift() : DEFAULT_LANGUAGE;
	return { language, slug: slugFromSegments(segments), prefixed };
}

/** Delivery API parameters that select a Language; English needs none. */
export const deliveryLanguageParams = (language) =>
	language === DEFAULT_LANGUAGE ? {} : { language };

const SEARCH_TEXT_PARAM = 'q';

/**
 * The switcher's options for the page at `pathname` (the visitor-facing path,
 * prefixed or not) with the query string `search`: one per Language, in the
 * Language's own name, pointing at the same slug. Filter params and unknown
 * params carry over; Search Text (`q`) is dropped because words typed in one
 * Language may match nothing in another.
 */
export function switcherTargets({ language, pathname, search = '' }) {
	const { slug } = parsePath(pathname);
	const params = new URLSearchParams(search);
	params.delete(SEARCH_TEXT_PARAM);
	const query = params.toString();
	return LANGUAGES.map(({ code, label }) => {
		const path = withPrefix(slug, code);
		return {
			code,
			label,
			href: query ? `${path}?${query}` : path,
			current: code === language,
		};
	});
}

// The Delivery API returns full_slug with the Language code on it
// (de/destinations/lisbon) when a request names a Language, so parsePath
// drops any code before the target prefix goes on.
const withPrefix = (slug, language) => {
	const path = parsePath(slug).slug;
	const prefix = language === DEFAULT_LANGUAGE ? '' : `/${language}`;
	if (path === HOME_SLUG) return prefix || '/';
	return `${prefix}/${path}`;
};

/**
 * hreflang alternates for the page at `slug`: one URL per Language plus
 * `x-default`, which is the English URL. Paths are relative; Next resolves
 * them against `metadataBase`.
 */
export function alternateLanguages(slug) {
	const alternates = Object.fromEntries(
		LANGUAGES.map(({ code }) => [code, withPrefix(slug, code)]),
	);
	return { ...alternates, 'x-default': alternates[DEFAULT_LANGUAGE] };
}

/** Href of a Language's home page: `/` for English, `/<code>` otherwise. */
export const homeHref = (language) => withPrefix('', language);

/** Href of a resolved story object (e.g. a page found by a lookup query). */
export const storyHref = (story, language) =>
	withPrefix(story?.full_slug || '', language);

// A path on this site (/about), as opposed to another host
// (https://..., //cdn...) or a fragment.
const isSitePath = (url) => url.startsWith('/') && !url.startsWith('//');

const splitQuery = (url) => {
	const index = url.indexOf('?');
	return index === -1 ? [url, ''] : [url.slice(0, index), url.slice(index)];
};

/**
 * Turns a Storyblok multilink value into an href in a Language. Story links
 * and url links to a site path (/about) take the Language's prefix; other url
 * links, email and asset links render as written.
 */
export function linkHref(link, language) {
	if (!link) return '#';

	const anchor = link.anchor ? `#${link.anchor}` : '';

	switch (link.linktype) {
		case 'story': {
			const slug = link.cached_url || link.story?.full_slug || '';
			return `${withPrefix(slug, language)}${anchor}`;
		}
		case 'email':
			return `mailto:${link.email || link.url}`;
		case 'url': {
			const url = link.url || link.cached_url || '';
			if (!isSitePath(url)) return `${url || '#'}${anchor}`;
			const [path, query] = splitQuery(url);
			return `${withPrefix(path, language)}${query}${anchor}`;
		}
		case 'asset':
		default:
			return `${link.url || link.cached_url || '#'}${anchor}`;
	}
}
