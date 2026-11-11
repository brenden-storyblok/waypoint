import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

const lang = vi.fn();
vi.mock('next/root-params', () => ({ lang }));

const { default: NavLink } = await import('@/components/NavLink');

beforeEach(() => {
	lang.mockResolvedValue('en');
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
		lang.mockResolvedValue('de');
		const html = await render({});
		expect(html).toContain('href="/de/destinations"');
	});

	it('points the home story at /de in German', async () => {
		lang.mockResolvedValue('de');
		const html = await render({
			link: { linktype: 'story', cached_url: 'home' },
		});
		expect(html).toContain('href="/de"');
	});

	it.each(['en', 'de'])(
		'renders a manual URL and an email as written in %s',
		async (code) => {
			lang.mockResolvedValue(code);
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
