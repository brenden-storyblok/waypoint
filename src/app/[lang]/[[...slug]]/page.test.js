import { Suspense } from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/root-params', () => ({ lang: vi.fn() }));

vi.mock('@/lib/storyblok', () => ({ RESOLVE_RELATIONS: [] }));
vi.mock('@/lib/content', () => ({
	getStory: vi.fn(),
	StoryNotFoundError: class StoryNotFoundError extends Error {},
}));
vi.mock('@storyblok/react/rsc', () => ({ StoryblokStory: vi.fn() }));
vi.mock('next/navigation', () => ({
	notFound: vi.fn(() => {
		throw new Error('NEXT_NOT_FOUND');
	}),
}));

const {
	default: Page,
	generateMetadata,
	generateStaticParams,
} = await import('./page');

// Renders the page's content, which waits inside the Suspense boundary Page returns.
const renderContent = async (props) => {
	const { children } = Page(props).props;
	return children.type(children.props);
};

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

describe('generateStaticParams', () => {
	it('prerenders the home page only, leaving the Languages to the layout', () => {
		expect(generateStaticParams()).toEqual([{ slug: [] }]);
	});
});

describe('Page', () => {
	it('waits for its content inside a Suspense boundary', () => {
		const element = Page({
			params: Promise.resolve({ slug: undefined }),
			searchParams: Promise.resolve({}),
		});
		expect(element.type).toBe(Suspense);
	});

	it('hands the searchParams promise to its bloks without awaiting it', async () => {
		const { getStory } = await import('@/lib/content');
		const { lang } = await import('next/root-params');
		const { StoryblokStory } = await import('@storyblok/react/rsc');
		lang.mockResolvedValue('en');
		getStory.mockResolvedValue({ id: 1 });
		// A promise that never settles proves the page does not wait on it.
		const pendingSearchParams = new Promise(() => {});

		const element = await renderContent({
			params: Promise.resolve({ slug: undefined }),
			searchParams: pendingSearchParams,
		});

		expect(element.type).toBe(StoryblokStory);
		expect(element.props.searchParams).toBe(pendingSearchParams);
	});

	it('reads the story at the slug in the current Language', async () => {
		const { getStory } = await import('@/lib/content');
		const { lang } = await import('next/root-params');
		lang.mockResolvedValue('de');
		getStory.mockResolvedValue({ id: 1 });
		await renderContent({
			params: Promise.resolve({ slug: ['destinations', 'lisbon'] }),
			searchParams: Promise.resolve({}),
		});
		expect(getStory).toHaveBeenCalledWith('destinations/lisbon', 'de');
	});

	it('answers a missing story with a 404', async () => {
		const { getStory, StoryNotFoundError } = await import('@/lib/content');
		const { notFound } = await import('next/navigation');
		getStory.mockRejectedValue(new StoryNotFoundError('nowhere'));
		await expect(
			renderContent({
				params: Promise.resolve({ slug: ['nowhere'] }),
				searchParams: Promise.resolve({}),
			}),
		).rejects.toThrow('NEXT_NOT_FOUND');
		expect(notFound).toHaveBeenCalled();
	});

	it('lets any other failure through', async () => {
		const { getStory } = await import('@/lib/content');
		getStory.mockRejectedValue(new Error('Delivery API down'));
		await expect(
			renderContent({
				params: Promise.resolve({ slug: ['lisbon'] }),
				searchParams: Promise.resolve({}),
			}),
		).rejects.toThrow('Delivery API down');
	});
});
