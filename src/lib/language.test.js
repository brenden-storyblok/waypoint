import { describe, expect, it } from 'vitest';
import {
	DEFAULT_LANGUAGE,
	LANGUAGES,
	deliveryLanguageParams,
	isLanguage,
	parsePath,
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
