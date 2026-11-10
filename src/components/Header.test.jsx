import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import Header from '@/components/Header';
import { firstImage } from '@/test/firstImage';

const logoAsset = (overrides) => ({
	filename: 'https://a.storyblok.com/f/1/logo.png',
	alt: 'Waypoint',
	...overrides,
});

const renderImage = (logo) => {
	const html = renderToStaticMarkup(<Header blok={{ _uid: 'header', logo }} />);
	return firstImage(html);
};

describe('Header language switcher', () => {
	const renderSwitcher = (language) =>
		renderToStaticMarkup(
			<Header blok={{ _uid: 'header' }} language={language} />,
		);

	it('offers the four Languages by their own names', () => {
		const html = renderSwitcher('en');
		for (const label of ['English', 'Deutsch', 'Español', 'Français']) {
			expect(html).toContain(label);
		}
		for (const href of ['href="/"', 'href="/de"', 'href="/es"', 'href="/fr"']) {
			expect(html).toContain(href);
		}
	});

	it('is a navigation landmark named Language', () => {
		expect(renderSwitcher('en')).toContain('aria-label="Language"');
	});

	it('marks the current Language as current and no other', () => {
		const html = renderSwitcher('de');
		expect(html.match(/aria-current="true"/g)).toHaveLength(1);
		expect(html).toMatch(/aria-current="true"[^>]*>Deutsch/);
	});

	it('shows the current code as the compact control', () => {
		expect(renderSwitcher('fr')).toMatch(/<span[^>]*>FR<\/span>/);
	});
});

describe('Header', () => {
	it('sizes the logo to 32px high with a width from the asset ratio', () => {
		const html = renderToStaticMarkup(
			<Header
				blok={{
					_uid: 'header',
					logo: logoAsset({ meta_data: { size: '1200x400' } }),
				}}
			/>,
		);
		const image = firstImage(html);
		expect(image).toContain('width="96"');
		expect(image).toContain('height="32"');
		expect(image).toContain('alt="Waypoint"');
		expect(image).toContain('class="block h-8 w-auto"');
		expect(image).toContain(
			'https://a.storyblok.com/f/1/logo.png/m/96x0/filters:quality(75)',
		);
		expect(html).not.toMatch(/way<span/);
	});

	it('falls back to a 4:1 ratio when the logo has no size', () => {
		const image = renderImage(logoAsset());
		expect(image).toContain('width="128"');
		expect(image).toContain('height="32"');
	});

	it('falls back to a 4:1 ratio when the size cannot be parsed', () => {
		const image = renderImage(logoAsset({ meta_data: { size: 'wide' } }));
		expect(image).toContain('width="128"');
	});

	it('serves an SVG logo from its original URL', () => {
		const image = renderImage(
			logoAsset({
				filename: 'https://a.storyblok.com/f/1/logo.svg',
				meta_data: { size: '400x100' },
			}),
		);
		expect(image).toContain('src="https://a.storyblok.com/f/1/logo.svg"');
		expect(image).not.toContain('/m/');
		expect(image).not.toContain('srcSet');
	});

	it('shows the text wordmark when there is no logo', () => {
		const html = renderToStaticMarkup(
			<Header blok={{ _uid: 'header', logo: null }} />,
		);
		expect(html).not.toContain('<img');
		expect(html).toMatch(/way<span [^>]*>point<\/span>/);
	});
});
