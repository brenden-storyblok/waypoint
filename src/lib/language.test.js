import { describe, expect, it } from 'vitest';
import {
	DEFAULT_LANGUAGE,
	LANGUAGES,
	deliveryLanguageParams,
	isLanguage,
	parsePath,
} from '@/lib/language';

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
