import { describe, expect, it } from 'vitest';
import {
	DEFAULT_LANGUAGE,
	LANGUAGES,
	deliveryLanguageParams,
	homeHref,
	isLanguage,
	linkHref,
	parsePath,
	storyHref,
	switcherTargets,
} from '@/lib/language';

describe('switcherTargets', () => {
	const hrefs = (targets) =>
		Object.fromEntries(targets.map((target) => [target.code, target.href]));

	it('offers one target per Language, labelled in its own name', () => {
		const targets = switcherTargets({ language: 'en', pathname: '/' });
		expect(targets.map((target) => [target.code, target.label])).toEqual([
			['en', 'English'],
			['de', 'Deutsch'],
			['es', 'Español'],
			['fr', 'Français'],
		]);
	});

	it('marks only the current Language', () => {
		const targets = switcherTargets({ language: 'de', pathname: '/de' });
		expect(
			targets.filter((target) => target.current).map((target) => target.code),
		).toEqual(['de']);
	});

	it('points the home page at / for English and /<code> for the others', () => {
		expect(hrefs(switcherTargets({ language: 'en', pathname: '/' }))).toEqual({
			en: '/',
			de: '/de',
			es: '/es',
			fr: '/fr',
		});
	});

	it('keeps the slug of a deeper page and leaves English unprefixed', () => {
		expect(
			hrefs(
				switcherTargets({
					language: 'de',
					pathname: '/de/destinations/lisbon',
				}),
			),
		).toEqual({
			en: '/destinations/lisbon',
			de: '/de/destinations/lisbon',
			es: '/es/destinations/lisbon',
			fr: '/fr/destinations/lisbon',
		});
	});

	it('keeps country and attribute params and drops q', () => {
		const targets = switcherTargets({
			language: 'en',
			pathname: '/destinations',
			search: '?q=lisbon&country=portugal&country=spain&attribute=beach',
		});
		expect(hrefs(targets).de).toBe(
			'/de/destinations?country=portugal&country=spain&attribute=beach',
		);
	});

	it('keeps other params', () => {
		const targets = switcherTargets({
			language: 'en',
			pathname: '/',
			search: 'q=x&utm_source=news',
		});
		expect(hrefs(targets).fr).toBe('/fr?utm_source=news');
	});

	it('leaves no trailing ? when q was the only param', () => {
		const targets = switcherTargets({
			language: 'en',
			pathname: '/destinations',
			search: '?q=lisbon',
		});
		expect(hrefs(targets).es).toBe('/es/destinations');
	});
});

describe('parsePath', () => {
	it('reads an unprefixed path as English with the whole path as the slug', () => {
		expect(parsePath('/destinations/lisbon')).toEqual({
			language: 'en',
			slug: 'destinations/lisbon',
			prefixed: false,
		});
	});

	it.each(['de', 'es', 'fr'])(
		'strips the /%s prefix into the Language',
		(code) => {
			expect(parsePath(`/${code}/destinations/lisbon`)).toEqual({
				language: code,
				slug: 'destinations/lisbon',
				prefixed: true,
			});
		},
	);

	it('marks an /en prefix so the proxy can redirect it', () => {
		expect(parsePath('/en/destinations/lisbon')).toEqual({
			language: 'en',
			slug: 'destinations/lisbon',
			prefixed: true,
		});
	});

	it('keeps an unknown code in the slug', () => {
		expect(parsePath('/it/lisbon')).toEqual({
			language: 'en',
			slug: 'it/lisbon',
			prefixed: false,
		});
	});

	it('maps the root to the home story in English', () => {
		expect(parsePath('/')).toEqual({
			language: 'en',
			slug: 'home',
			prefixed: false,
		});
	});

	it.each(['/de', '/de/'])(
		'maps %s to the home story in German',
		(pathname) => {
			expect(parsePath(pathname)).toEqual({
				language: 'de',
				slug: 'home',
				prefixed: true,
			});
		},
	);

	it('does not treat a slug that merely starts with a code as a prefix', () => {
		expect(parsePath('/deutschland').language).toBe('en');
	});
});

describe('Languages', () => {
	it('lists English first as the default, then German, Spanish and French', () => {
		expect(DEFAULT_LANGUAGE).toBe('en');
		expect(LANGUAGES.map((language) => language.code)).toEqual([
			'en',
			'de',
			'es',
			'fr',
		]);
	});

	it('recognises only the four codes', () => {
		expect(isLanguage('fr')).toBe(true);
		expect(isLanguage('it')).toBe(false);
	});
});

describe('deliveryLanguageParams', () => {
	it('sends no language parameter for English', () => {
		expect(deliveryLanguageParams('en')).toEqual({});
	});

	it('sends the code as the language parameter for other Languages', () => {
		expect(deliveryLanguageParams('de')).toEqual({ language: 'de' });
	});
});

describe('linkHref', () => {
	const story = (slug, extra) => ({
		linktype: 'story',
		cached_url: slug,
		...extra,
	});

	it('leaves an English story link as it renders today', () => {
		expect(linkHref(story('destinations/lisbon'), 'en')).toBe(
			'/destinations/lisbon',
		);
	});

	it.each(['de', 'es', 'fr'])('prefixes a story link with /%s', (code) => {
		expect(linkHref(story('destinations/lisbon'), code)).toBe(
			`/${code}/destinations/lisbon`,
		);
	});

	it('maps the home story to / in English and /<code> in German', () => {
		expect(linkHref(story('home'), 'en')).toBe('/');
		expect(linkHref(story('home'), 'de')).toBe('/de');
	});

	it('maps an empty story link to the Language home', () => {
		expect(linkHref(story(''), 'en')).toBe('/');
		expect(linkHref(story(''), 'fr')).toBe('/fr');
	});

	it('keeps the anchor after the prefixed slug', () => {
		expect(linkHref(story('about', { anchor: 'team' }), 'de')).toBe(
			'/de/about#team',
		);
		expect(linkHref(story('home', { anchor: 'team' }), 'de')).toBe('/de#team');
		expect(linkHref(story('home', { anchor: 'team' }), 'en')).toBe('/#team');
	});

	it('falls back to the story full_slug and strips leading slashes', () => {
		expect(
			linkHref({ linktype: 'story', story: { full_slug: 'about' } }, 'de'),
		).toBe('/de/about');
		expect(linkHref(story('/about'), 'de')).toBe('/de/about');
	});

	it.each(['en', 'de'])('renders a url link as written in %s', (code) => {
		expect(
			linkHref(
				{ linktype: 'url', url: 'https://example.com/book', anchor: 'x' },
				code,
			),
		).toBe('https://example.com/book#x');
		expect(linkHref({ linktype: 'url', url: '/de/partner' }, code)).toBe(
			'/de/partner',
		);
	});

	it.each(['en', 'de'])('renders an email link as mailto in %s', (code) => {
		expect(linkHref({ linktype: 'email', email: 'hi@example.com' }, code)).toBe(
			'mailto:hi@example.com',
		);
	});

	it.each(['en', 'de'])('renders an asset link as written in %s', (code) => {
		expect(
			linkHref(
				{ linktype: 'asset', url: 'https://a.storyblok.com/f/1/guide.pdf' },
				code,
			),
		).toBe('https://a.storyblok.com/f/1/guide.pdf');
	});

	it('returns # for a missing link', () => {
		expect(linkHref(undefined, 'de')).toBe('#');
	});
});

describe('storyHref', () => {
	it('prefixes a story full_slug with the Language', () => {
		expect(storyHref({ full_slug: 'destinations/lisbon' }, 'en')).toBe(
			'/destinations/lisbon',
		);
		expect(storyHref({ full_slug: 'destinations/lisbon' }, 'de')).toBe(
			'/de/destinations/lisbon',
		);
	});

	it('maps the home story to the Language home', () => {
		expect(storyHref({ full_slug: 'home' }, 'en')).toBe('/');
		expect(storyHref({ full_slug: 'home' }, 'es')).toBe('/es');
	});
});

describe('homeHref', () => {
	it('is / in English and /<code> otherwise', () => {
		expect(homeHref('en')).toBe('/');
		expect(homeHref('fr')).toBe('/fr');
	});
});
