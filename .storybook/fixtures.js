// Real space content from the CLI pull in .storyblok/stories/source, written
// to fixtures.data.json by build-fixtures.mjs (npm run storybook:fixtures).
import stories from './fixtures.data.json';

const storyBySlug = new Map(stories.map((story) => [story.full_slug, story]));

/** The story at `fullSlug`, e.g. 'data/destinations/lisbon'. Throws when missing. */
export function story(fullSlug) {
	const found = storyBySlug.get(fullSlug);
	if (!found) throw new Error(`No fixture story at "${fullSlug}"`);
	return found;
}

/** Every blok of `component` in a story's content, in document order. */
export function bloks(fullSlug, component) {
	const found = [];
	const walk = (node) => {
		if (Array.isArray(node)) return node.forEach(walk);
		if (!node || typeof node !== 'object') return;
		if (node.component === component) found.push(node);
		Object.values(node).forEach(walk);
	};
	walk(story(fullSlug).content);
	return found;
}
