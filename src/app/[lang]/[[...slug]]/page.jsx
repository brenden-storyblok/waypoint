import { notFound } from 'next/navigation';
import { StoryblokStory } from '@storyblok/react/rsc';
import { getStoryblokApi, RESOLVE_RELATIONS } from '@/lib/storyblok';
import { lang } from 'next/root-params';
import {
	alternateLanguages,
	deliveryLanguageParams,
	slugFromSegments,
} from '@/lib/language';

// Folders that hold data records or site chrome, never routable pages.
const NON_ROUTABLE_PREFIXES = ['data/', 'global/'];

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

export default async function Page({ params, searchParams }) {
	const { slug } = await params;
	// Handed down to bloks that read the visitor's choices (destination grid).
	const query = await searchParams;

	let fullSlug = slugFromSegments(slug);

	if (NON_ROUTABLE_PREFIXES.some((prefix) => fullSlug.startsWith(prefix))) {
		notFound();
	}

	const language = await lang();

	let sbParams = {
		version: 'draft',
		...deliveryLanguageParams(language),
		resolve_relations: RESOLVE_RELATIONS.join(','),
	};

	const storyblokApi = getStoryblokApi();

	let data;
	try {
		({ data } = await storyblokApi.get(`cdn/stories/${fullSlug}`, sbParams));
	} catch (error) {
		if (error?.status === 404) notFound();
		throw error;
	}

	return (
		<StoryblokStory
			story={data.story}
			bridgeOptions={{ resolveRelations: RESOLVE_RELATIONS }}
			searchParams={query}
		/>
	);
}
