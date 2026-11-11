import { cache } from 'react';
import { lang } from 'next/root-params';
import { getStoryblokApi } from '@/lib/storyblok';
import { DEFAULT_LANGUAGE } from '@/lib/language';

/** The datasource holding interface copy that belongs to no single block. */
const UI_LABELS = 'ui-labels';

// The Language's label, or the English one when no one translated the entry.
const entryLabel = (entry) => entry.dimension_value || entry.name;

/**
 * A datasource's labels in a Language, in datasource order: { value: label }.
 * Keys are the stored `entry.value`, so Filter URLs work in every Language.
 * Cached per request: each datasource and Language is fetched once per page.
 * Server code only; a Client Component receives labels as props.
 */
export const loadLabels = cache(async (datasource, language) => {
	try {
		const entries = await getStoryblokApi().getAll(
			'cdn/datasource_entries',
			{
				datasource,
				...(language !== DEFAULT_LANGUAGE && { dimension: language }),
			},
			'datasource_entries',
		);
		return Object.fromEntries(
			entries.map((entry) => [entry.value, entryLabel(entry)]),
		);
	} catch (error) {
		console.error(`labels: ${datasource} failed`, error);
		return {};
	}
});

/** One UI Label in the current Language, or the key itself when no entry matches. */
export async function getLabel(key) {
	const labels = await loadLabels(UI_LABELS, await lang());
	return Object.hasOwn(labels, key) ? labels[key] : key;
}
