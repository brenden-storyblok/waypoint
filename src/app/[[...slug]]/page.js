import { notFound } from 'next/navigation';
import { StoryblokStory } from '@storyblok/react/rsc';
import { getStoryblokApi, RESOLVE_RELATIONS } from '@/lib/storyblok';

// Folders that hold data records or site chrome, never routable pages.
const NON_ROUTABLE_PREFIXES = ['data/', 'global/'];

export default async function Page({ params }) {
	const { slug } = await params;

	let fullSlug = slug ? slug.join('/') : 'home';

	if (NON_ROUTABLE_PREFIXES.some((prefix) => fullSlug.startsWith(prefix))) {
		notFound();
	}

	let sbParams = {
		version: 'draft',
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
		/>
	);
}
