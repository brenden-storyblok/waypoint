import { beforeEach, describe, expect, it, vi } from 'vitest';

const getCurrentLanguage = vi.fn();
vi.mock('@/lib/currentLanguage', () => ({ getCurrentLanguage }));

const getLabel = vi.fn();
vi.mock('@/lib/labels', () => ({ getLabel }));

vi.mock('@/lib/storyblok', () => ({
	getStoryblokApi: vi.fn(),
	RESOLVE_RELATIONS: [],
}));
vi.mock('@storyblok/react/rsc', () => ({ StoryblokStory: vi.fn() }));
vi.mock('next/navigation', () => ({ notFound: vi.fn() }));

const { generateMetadata } = await import('./page');

beforeEach(() => {
	getCurrentLanguage.mockResolvedValue('en');
	getLabel.mockImplementation(async (key, language) => `${key}:${language}`);
});

const metadataFor = (slug) => generateMetadata({ params: Promise.resolve({ slug }) });

describe('generateMetadata', () => {
	it('reads title and description from UI Labels in the page Language', async () => {
		getCurrentLanguage.mockResolvedValue('fr');
		const metadata = await metadataFor(undefined);
		expect(metadata.title).toBe('site-title:fr');
		expect(metadata.description).toBe('site-description:fr');
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
