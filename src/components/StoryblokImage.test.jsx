import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import StoryblokImage from '@/components/StoryblokImage';

const base = 'https://a.storyblok.com/f/1/photo.jpg';
const asset = (overrides = {}) => ({
	filename: base,
	alt: 'A harbour at dusk',
	focus: '',
	...overrides,
});
const render = (props) =>
	renderToStaticMarkup(<StoryblokImage fill sizes="100vw" {...props} />);

describe('StoryblokImage', () => {
	it('keeps the natural ratio when there is no crop', () => {
		const html = render({ asset: asset() });
		expect(html).toContain(`${base}/m/640x0/filters:quality(75) 640w`);
		expect(html).toContain(`${base}/m/3840x0/filters:quality(75) 3840w`);
		expect(html).not.toContain('/smart');
		expect(html).not.toContain('filters:format');
	});

	it('renders nothing when the asset has no filename', () => {
		expect(render({ asset: asset({ filename: '' }) })).toBe('');
		expect(render({ asset: null })).toBe('');
	});

	it('crops with the Focus Point when the asset has one', () => {
		const html = render({
			asset: asset({ focus: '400x225:401x226' }),
			crop: '4:5',
		});
		expect(html).toContain(
			`${base}/m/640x800/filters:focal(400x225:401x226):quality(75) 640w`,
		);
		expect(html).not.toContain('/smart');
	});

	it('crops with smart when the asset has no Focus Point', () => {
		const html = render({ asset: asset(), crop: '4:5' });
		expect(html).toContain(`${base}/m/640x800/smart/filters:quality(75) 640w`);
		expect(html).not.toContain('focal');
	});

	it('derives the height from any ratio', () => {
		expect(render({ asset: asset(), crop: '16:9' })).toContain(
			'/m/640x360/smart/',
		);
		expect(render({ asset: asset(), crop: '1:1' })).toContain(
			'/m/640x640/smart/',
		);
	});

	it('maps quality to the quality filter', () => {
		expect(render({ asset: asset(), quality: 50 })).toContain(
			'/m/640x0/filters:quality(50) 640w',
		);
	});

	it.each(['svg', 'gif'])('passes a %s through unchanged', (extension) => {
		const filename = `https://a.storyblok.com/f/1/anim.${extension}`;
		const html = render({ asset: asset({ filename }), crop: '4:5' });
		expect(html).toContain(`src="${filename}"`);
		expect(html).not.toContain('/m/');
		expect(html).not.toContain('srcSet');
	});

	it('defaults alt to the asset alt and lets a caller override it', () => {
		expect(render({ asset: asset() })).toContain('alt="A harbour at dusk"');
		expect(render({ asset: asset(), alt: 'Boats' })).toContain('alt="Boats"');
	});

	it('passes className, sizes and loading through', () => {
		const html = render({
			asset: asset(),
			className: 'object-cover',
			sizes: '(min-width: 768px) 33vw, 100vw',
			loading: 'eager',
		});
		expect(html).toContain('class="object-cover"');
		expect(html).toContain('sizes="(min-width: 768px) 33vw, 100vw"');
		expect(html).toContain('loading="eager"');
	});

	it('ignores a caller src', () => {
		const html = render({ asset: asset(), src: 'https://evil.test/x.jpg' });
		expect(html).not.toContain('evil.test');
	});
});
