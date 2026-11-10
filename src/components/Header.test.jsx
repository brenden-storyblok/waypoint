import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { firstImage } from '@/test/firstImage';

const getCurrentLanguage = vi.fn();
vi.mock('@/lib/currentLanguage', () => ({ getCurrentLanguage }));

const { default: Header } = await import('@/components/Header');

beforeEach(() => {
	getCurrentLanguage.mockResolvedValue('en');
});

/** Header is an async Server Component: await it, then render the element. */
const render = async (fields) =>
	renderToStaticMarkup(await Header({ blok: { _uid: 'header', ...fields } }));

const logoAsset = (overrides) => ({
	filename: 'https://a.storyblok.com/f/1/logo.png',
	alt: 'Waypoint',
	...overrides,
});

const renderImage = async (logo) => firstImage(await render({ logo }));

describe('Header language switcher', () => {
	const renderSwitcher = async (language) => {
		getCurrentLanguage.mockResolvedValue(language);
		return render({});
	};

	it('offers the four Languages by their own names', async () => {
		const html = await renderSwitcher('en');
		for (const label of ['English', 'Deutsch', 'Español', 'Français']) {
			expect(html).toContain(label);
		}
		for (const href of ['href="/"', 'href="/de"', 'href="/es"', 'href="/fr"']) {
			expect(html).toContain(href);
		}
	});

	it('is a navigation landmark named Language', async () => {
		expect(await renderSwitcher('en')).toContain('aria-label="Language"');
	});

	it('marks the current Language as current and no other', async () => {
		const html = await renderSwitcher('de');
		expect(html.match(/aria-current="true"/g)).toHaveLength(1);
		expect(html).toMatch(/aria-current="true"[^>]*>Deutsch/);
	});

	it('shows the current code as the compact control', async () => {
		expect(await renderSwitcher('fr')).toMatch(/<span[^>]*>FR<\/span>/);
	});
});

describe('Header', () => {
	it('sizes the logo to 32px high with a width from the asset ratio', async () => {
		const html = await render({
			logo: logoAsset({ meta_data: { size: '1200x400' } }),
		});
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

	it('falls back to a 4:1 ratio when the logo has no size', async () => {
		const image = await renderImage(logoAsset());
		expect(image).toContain('width="128"');
		expect(image).toContain('height="32"');
	});

	it('falls back to a 4:1 ratio when the size cannot be parsed', async () => {
		const image = await renderImage(logoAsset({ meta_data: { size: 'wide' } }));
		expect(image).toContain('width="128"');
	});

	it('serves an SVG logo from its original URL', async () => {
		const image = await renderImage(
			logoAsset({
				filename: 'https://a.storyblok.com/f/1/logo.svg',
				meta_data: { size: '400x100' },
			}),
		);
		expect(image).toContain('src="https://a.storyblok.com/f/1/logo.svg"');
		expect(image).not.toContain('/m/');
		expect(image).not.toContain('srcSet');
	});

	it('shows the text wordmark when there is no logo', async () => {
		const html = await render({ logo: null });
		expect(html).not.toContain('<img');
		expect(html).toMatch(/way<span [^>]*>point<\/span>/);
	});

	it('links the logo to / in English', async () => {
		const html = await render({ logo: null });
		expect(html).toMatch(/<a [^>]*href="\/"/);
	});

	it('links the logo to the German home in German', async () => {
		getCurrentLanguage.mockResolvedValue('de');
		const html = await render({ logo: null });
		expect(html).toMatch(/<a [^>]*href="\/de"/);
	});
});
