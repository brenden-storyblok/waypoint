import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { StoryblokStory } from '@storyblok/react/rsc';
import { RESOLVE_RELATIONS } from '@/lib/storyblok';
import { StoryNotFoundError, getStory } from '@/lib/content';
import { lang } from 'next/root-params';
import { alternateLanguages, slugFromSegments } from '@/lib/language';

// Folders that hold data records or site chrome, never routable pages.
const NON_ROUTABLE_PREFIXES = ['data/', 'global/'];

/**
 * Prerender the home page and no other. The layout supplies each Language, so this
 * adds the empty slug; every other page gets the App Shell on its first visit
 * and the cached page after it.
 */
export const generateStaticParams = () => [{ slug: [] }];

/**
 * Title and description are inherited from the layout; only the alternates
 * need the page's slug.
 */
export async function generateMetadata({ params }) {
	const { slug } = await params;
	return {
		alternates: { languages: alternateLanguages(slugFromSegments(slug)) },
	};
}

async function PageContent({ params, searchParams }) {
	const { slug } = await params;
	const fullSlug = slugFromSegments(slug);

	if (NON_ROUTABLE_PREFIXES.some((prefix) => fullSlug.startsWith(prefix))) {
		notFound();
	}

	const language = await lang();

	let story;
	try {
		story = await getStory(fullSlug, language);
	} catch (error) {
		if (error instanceof StoryNotFoundError) notFound();
		throw error;
	}

	return (
		<StoryblokStory
			story={story}
			bridgeOptions={{ resolveRelations: RESOLVE_RELATIONS }}
			// A promise: the bloks that read the visitor's choices await it inside
			// their own <Suspense> boundary, so the page itself never waits on it.
			searchParams={searchParams}
		/>
	);
}

/**
 * The page is a shell around its content: `params` and the story are unknown
 * until request time for a page the build did not prerender, so they wait
 * inside the boundary. A first visit gets the layout (header, footer) at once
 * and the content streams in; a prerendered page has the content in its HTML.
 */
export default function Page(props) {
	return (
		<Suspense fallback={null}>
			<PageContent {...props} />
		</Suspense>
	);
}
