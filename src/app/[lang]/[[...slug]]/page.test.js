import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/currentLanguage', () => ({ getCurrentLanguage: vi.fn() }));

vi.mock('@/lib/storyblok', () => ({
	getStoryblokApi: vi.fn(),
	RESOLVE_RELATIONS: [],
}));
vi.mock('@storyblok/react/rsc', () => ({ StoryblokStory: vi.fn() }));
vi.mock('next/navigation', () => ({ notFound: vi.fn() }));

const { generateMetadata } = await import('./page');

const metadataFor = (slug) =>
	generateMetadata({ params: Promise.resolve({ slug }) });

describe('generateMetadata', () => {
	it('leaves title and description to the layout', async () => {
		const metadata = await metadataFor(undefined);
		expect(metadata).not.toHaveProperty('title');
		expect(metadata).not.toHaveProperty('description');
	});

	it('emits hreflang alternates for the page slug', async () => {
		const { alternates } = await metadataFor(['destinations', 'lisbon']);
		expect(alternates.languages).toEqual({
			en: '/destinations/lisbon',
			de: '/de/destinations/lisbon',
			es: '/es/destinations/lisbon',
			fr: '/fr/destinations/lisbon',
			'x-default': '/destinations/lisbon',
		});
	});

	it('treats a missing slug as the home page', async () => {
		const { alternates } = await metadataFor(undefined);
		expect(alternates.languages.en).toBe('/');
		expect(alternates.languages.de).toBe('/de');
	});
});
