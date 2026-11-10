import { notFound } from 'next/navigation';
import { StoryblokStory } from '@storyblok/react/rsc';
import { getStoryblokApi, RESOLVE_RELATIONS } from '@/lib/storyblok';
import { getCurrentLanguage } from '@/lib/currentLanguage';
import { getLabel } from '@/lib/labels';
import { alternateLanguages, deliveryLanguageParams } from '@/lib/language';

// Folders that hold data records or site chrome, never routable pages.
const NON_ROUTABLE_PREFIXES = ['data/', 'global/'];

const slugOf = (slug) => (slug ? slug.join('/') : 'home');

/** Title and description are UI Labels; alternates need the page's slug. */
export async function generateMetadata({ params }) {
	const { slug } = await params;
	const language = await getCurrentLanguage();
	return {
		title: await getLabel('site-title', language),
		description: await getLabel('site-description', language),
		alternates: { languages: alternateLanguages(slugOf(slug)) },
	};
}

export default async function Page({ params, searchParams }) {
	const { slug } = await params;
	// Handed down to bloks that read the visitor's choices (destination grid).
	const query = await searchParams;

	let fullSlug = slugOf(slug);

	if (NON_ROUTABLE_PREFIXES.some((prefix) => fullSlug.startsWith(prefix))) {
		notFound();
	}

	const language = await getCurrentLanguage();

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
