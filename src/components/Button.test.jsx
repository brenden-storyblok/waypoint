import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import Button from '@/components/Button';

const classesOf = (html) => html.match(/class="([^"]*)"/)[1].split(' ');

const button = (fields) => ({
	_uid: 'button-uid',
	component: 'button',
	label: 'Book now',
	link: { linktype: 'url', url: 'https://example.com/book' },
	...fields,
});

describe('Button', () => {
	it('links its label to its link', () => {
		const html = renderToStaticMarkup(<Button blok={button({})} />);
		expect(html).toMatch(
			/<a [^>]*href="https:\/\/example.com\/book"[^>]*>Book now<\/a>/,
		);
	});

	it('fills a primary Button with the highlight color in both modes', () => {
		const classes = classesOf(
			renderToStaticMarkup(<Button blok={button({ variant: 'primary' })} />),
		);
		expect(classes).toEqual(
			expect.arrayContaining(['bg-sun-400', 'dark:bg-sun-300']),
		);
		expect(classes).not.toContain('border-current');
	});

	it('outlines a secondary Button and leaves it unfilled', () => {
		const classes = classesOf(
			renderToStaticMarkup(<Button blok={button({ variant: 'secondary' })} />),
		);
		expect(classes).toContain('border-current');
		expect(classes).not.toContain('border-transparent');
		expect(classes).not.toContain('bg-sun-400');
	});

	it('leaves a tertiary Button unfilled and without an outline', () => {
		const classes = classesOf(
			renderToStaticMarkup(<Button blok={button({ variant: 'tertiary' })} />),
		);
		expect(classes).toContain('border-transparent');
		expect(classes).not.toContain('border-current');
		expect(classes).not.toContain('bg-sun-400');
	});

	it('falls back to primary for an unknown variant', () => {
		const classes = classesOf(
			renderToStaticMarkup(<Button blok={button({ variant: 'ghost' })} />),
		);
		expect(classes).toContain('bg-sun-400');
	});

	it('shrinks a small Button', () => {
		const regular = classesOf(
			renderToStaticMarkup(<Button blok={button({})} />),
		);
		const small = classesOf(
			renderToStaticMarkup(<Button blok={button({})} size="sm" />),
		);
		expect(regular).toContain('text-lg');
		expect(small).toContain('text-sm');
		expect(small).not.toContain('text-lg');
	});
});
