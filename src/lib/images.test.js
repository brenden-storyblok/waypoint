import { describe, expect, it } from 'vitest';
import { storyblokImageUrl } from '@/lib/images';

const filename = 'https://a.storyblok.com/f/1/photo.jpg';

describe('storyblokImageUrl', () => {
	it('keeps the natural ratio without a crop', () => {
		expect(storyblokImageUrl({ filename }, { width: 640 })).toBe(
			`${filename}/m/640x0/filters:quality(75)`,
		);
	});

	it('crops with the Focus Point, or smart without one', () => {
		expect(
			storyblokImageUrl(
				{ filename, focus: '1x1:2x2' },
				{ width: 640, crop: '4:5', quality: 50 },
			),
		).toBe(`${filename}/m/640x800/filters:focal(1x1:2x2):quality(50)`);
		expect(storyblokImageUrl({ filename }, { width: 640, crop: '16:9' })).toBe(
			`${filename}/m/640x360/smart/filters:quality(75)`,
		);
	});
});
