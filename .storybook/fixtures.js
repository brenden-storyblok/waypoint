// Real space content from the CLI pull in .storyblok, written to
// fixtures.data.json by build-fixtures.mjs (npm run storybook:fixtures).
import fixtures from './fixtures.data.json';

const storyBySlug = new Map(
	fixtures.stories.map((fixtureStory) => [
		fixtureStory.full_slug,
		fixtureStory,
	]),
);
const storyByUuid = new Map(
	fixtures.stories.map((fixtureStory) => [fixtureStory.uuid, fixtureStory]),
);

// Mirrors RESOLVE_RELATIONS in src/lib/storyblok.js (not imported: that file
// pulls in the async DestinationGrid). Keep the two lists in step.
const RESOLVE_RELATIONS = [
	'destination_page.destination',
	'destination_grid.destinations',
	'faq_section.faqs',
];

const relationFieldsByComponent = new Map();
for (const relation of RESOLVE_RELATIONS) {
	const [component, field] = relation.split('.');
	relationFieldsByComponent.set(component, [
		...(relationFieldsByComponent.get(component) ?? []),
		field,
	]);
}

// The pull keeps relations as uuid strings; the Delivery API's
// resolve_relations swaps each for the full story. Unknown uuids stay as-is.
const resolveUuid = (value) => {
	const related = storyByUuid.get(value);
	return related ? structuredClone(related) : value;
};

// Mutates `node`, so only ever call it on a copy.
const resolveRelations = (node) => {
	if (Array.isArray(node)) return node.forEach(resolveRelations);
	if (!node || typeof node !== 'object') return;
	// Children first, so a story swapped in below isn't resolved again: the
	// API resolves one level, too.
	Object.values(node).forEach(resolveRelations);
	for (const field of relationFieldsByComponent.get(node.component) ?? []) {
		node[field] = Array.isArray(node[field])
			? node[field].map(resolveUuid)
			: resolveUuid(node[field]);
	}
};

/** A copy of the story at `fullSlug`, e.g. 'home', with its relations resolved. Throws when missing. */
export function story(fullSlug) {
	const found = storyBySlug.get(fullSlug);
	if (!found) throw new Error(`No fixture story at "${fullSlug}"`);
	const copy = structuredClone(found);
	resolveRelations(copy.content);
	return copy;
}

/** The Destination content at data/destinations/`slug`: the `destination` prop shape. */
export function destination(slug) {
	return story(`data/destinations/${slug}`).content;
}

/** Every Destination story, as DestinationGrid loads them when an editor picks none. */
export function destinations() {
	return fixtures.stories
		.filter((fixtureStory) => fixtureStory.content?.component === 'destination')
		.map((fixtureStory) => story(fixtureStory.full_slug));
}

/** The path of the Destination Page showing `destinationUuid`, as DestinationGrid looks it up. Undefined when none. */
export function destinationPageHref(destinationUuid) {
	const page = fixtures.stories.find(
		(fixtureStory) =>
			fixtureStory.content?.component === 'destination_page' &&
			fixtureStory.content.destination === destinationUuid,
	);
	return page && `/${page.full_slug}`;
}

/** The datasource `slug` as `{ value: name }`, in datasource order. */
export function datasourceLabels(slug) {
	const found = fixtures.datasources.find(
		(datasource) => datasource.slug === slug,
	);
	if (!found) throw new Error(`No fixture datasource "${slug}"`);
	return Object.fromEntries(
		found.entries.map(({ name, value }) => [value, name]),
	);
}

/** Every blok of `component` in a story's resolved content, in document order. */
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
