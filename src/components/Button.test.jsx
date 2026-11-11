import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

const lang = vi.fn();
vi.mock('next/root-params', () => ({ lang }));

const { default: Button } = await import('@/components/Button');

beforeEach(() => {
	lang.mockResolvedValue('en');
});

const classesOf = (html) => html.match(/class="([^"]*)"/)[1].split(' ');

const button = (fields) => ({
	_uid: 'button-uid',
	component: 'button',
	label: 'Book now',
	link: { linktype: 'url', url: 'https://example.com/book' },
	...fields,
});

const render = async (fields, size) =>
	renderToStaticMarkup(await Button({ blok: button(fields), size }));

describe('Button', () => {
	it('links its label to its link', async () => {
		const html = await render({});
		expect(html).toMatch(
			/<a [^>]*href="https:\/\/example.com\/book"[^>]*>Book now<\/a>/,
		);
	});

	it('links a story link as it does today in English', async () => {
		const html = await render({
			link: { linktype: 'story', cached_url: 'destinations/lisbon' },
		});
		expect(html).toContain('href="/destinations/lisbon"');
	});

	it('keeps the visitor in German on a story link', async () => {
		lang.mockResolvedValue('de');
		const html = await render({
			link: { linktype: 'story', cached_url: 'destinations/lisbon' },
		});
		expect(html).toContain('href="/de/destinations/lisbon"');
	});

	it('renders a manual URL as written in German', async () => {
		lang.mockResolvedValue('de');
		const html = await render({});
		expect(html).toContain('href="https://example.com/book"');
	});

	it('fills a primary Button with the highlight color in both modes', async () => {
		const classes = classesOf(await render({ variant: 'primary' }));
		expect(classes).toEqual(
			expect.arrayContaining(['bg-sun-400', 'dark:bg-sun-300']),
		);
		expect(classes).not.toContain('border-current');
	});

	it('outlines a secondary Button and leaves it unfilled', async () => {
		const classes = classesOf(await render({ variant: 'secondary' }));
		expect(classes).toContain('border-current');
		expect(classes).not.toContain('border-transparent');
		expect(classes).not.toContain('bg-sun-400');
	});

	it('leaves a tertiary Button unfilled and without an outline', async () => {
		const classes = classesOf(await render({ variant: 'tertiary' }));
		expect(classes).toContain('border-transparent');
		expect(classes).not.toContain('border-current');
		expect(classes).not.toContain('bg-sun-400');
	});

	it('falls back to primary for an unknown variant', async () => {
		const classes = classesOf(await render({ variant: 'ghost' }));
		expect(classes).toContain('bg-sun-400');
	});

	it('shrinks a small Button', async () => {
		const regular = classesOf(await render({}));
		const small = classesOf(await render({}, 'sm'));
		expect(regular).toContain('text-lg');
		expect(small).toContain('text-sm');
		expect(small).not.toContain('text-lg');
	});
});
