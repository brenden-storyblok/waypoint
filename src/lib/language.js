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
 * Splits a request path into its Language and story slug. Only a known code
 * as the first segment is a prefix; anything else belongs to the slug of an
 * English page. `prefixed` tells the proxy whether the path carried a code.
 */
export function parsePath(pathname) {
	const segments = pathname.split('/').filter(Boolean);
	const prefixed = isLanguage(segments[0]);
	const language = prefixed ? segments.shift() : DEFAULT_LANGUAGE;
	return { language, slug: segments.join('/') || HOME_SLUG, prefixed };
}

/** Delivery API parameters that select a Language; English needs none. */
export const deliveryLanguageParams = (language) =>
	language === DEFAULT_LANGUAGE ? {} : { language };
