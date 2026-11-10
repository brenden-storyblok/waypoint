import { beforeEach, describe, expect, it, vi } from 'vitest';

const getCurrentLanguage = vi.fn();
vi.mock('@/lib/currentLanguage', () => ({ getCurrentLanguage }));

const getLabel = vi.fn();
vi.mock('@/lib/labels', () => ({ getLabel }));

vi.mock('next/font/google', () => {
	const font = () => ({ variable: 'font-variable' });
	return {
		Bricolage_Grotesque: font,
		Source_Serif_4: font,
		JetBrains_Mono: font,
	};
});
vi.mock('next/navigation', () => ({ notFound: vi.fn() }));
vi.mock('@storyblok/react/rsc', () => ({ StoryblokServerComponent: vi.fn() }));
vi.mock('@/components/StoryblokProvider', () => ({ default: vi.fn() }));
vi.mock('@/lib/storyblok', () => ({ getStoryblokApi: vi.fn() }));
vi.mock('../globals.css', () => ({}));

const { generateMetadata } = await import('./layout');

beforeEach(() => {
	getCurrentLanguage.mockResolvedValue('en');
	getLabel.mockImplementation(async (key, language) => `${key}:${language}`);
});

describe('generateMetadata', () => {
	it('gives every page, 404s included, a title and description from UI Labels in the current Language', async () => {
		getCurrentLanguage.mockResolvedValue('fr');
		const metadata = await generateMetadata();
		expect(metadata.title).toBe('site-title:fr');
		expect(metadata.description).toBe('site-description:fr');
	});
});
