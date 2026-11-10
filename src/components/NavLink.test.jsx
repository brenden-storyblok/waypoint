import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

const getCurrentLanguage = vi.fn();
vi.mock('@/lib/currentLanguage', () => ({ getCurrentLanguage }));

const { default: NavLink } = await import('@/components/NavLink');

beforeEach(() => {
	getCurrentLanguage.mockResolvedValue('en');
});

const navLink = (fields) => ({
	_uid: 'nav-link-uid',
	component: 'nav_link',
	label: 'Destinations',
	link: { linktype: 'story', cached_url: 'destinations' },
	...fields,
});

const render = async (fields) =>
	renderToStaticMarkup(await NavLink({ blok: navLink(fields) }));

describe('NavLink', () => {
	it('links a story link as it does today in English', async () => {
		const html = await render({});
		expect(html).toMatch(
			/<a [^>]*href="\/destinations"[^>]*>Destinations<\/a>/,
		);
	});

	it('keeps the visitor in German on a story link', async () => {
		getCurrentLanguage.mockResolvedValue('de');
		const html = await render({});
		expect(html).toContain('href="/de/destinations"');
	});

	it('points the home story at /de in German', async () => {
		getCurrentLanguage.mockResolvedValue('de');
		const html = await render({
			link: { linktype: 'story', cached_url: 'home' },
		});
		expect(html).toContain('href="/de"');
	});

	it.each(['en', 'de'])(
		'renders a manual URL and an email as written in %s',
		async (code) => {
			getCurrentLanguage.mockResolvedValue(code);
			expect(
				await render({
					link: { linktype: 'url', url: 'https://example.com/partner' },
				}),
			).toContain('href="https://example.com/partner"');
			expect(
				await render({
					link: { linktype: 'email', email: 'hi@example.com' },
				}),
			).toContain('href="mailto:hi@example.com"');
		},
	);
});
