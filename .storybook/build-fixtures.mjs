// Writes .storybook/fixtures.data.json from the CLI pull in .storyblok. Stories
// import the JSON.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';

const storiesDir = new URL('../.storyblok/stories/source/', import.meta.url);
const datasourcesFile = new URL(
	'../.storyblok/datasources/source/datasources.json',
	import.meta.url,
);

const stories = readdirSync(storiesDir)
	.filter((fileName) => fileName.endsWith('.json'))
	.sort()
	.map((fileName) => {
		const { uuid, name, full_slug, content } = JSON.parse(
			readFileSync(new URL(fileName, storiesDir), 'utf8'),
		);
		return { uuid, name, full_slug, content };
	});

// Only what the label helper needs; the pull also carries ids and timestamps.
const datasources = JSON.parse(readFileSync(datasourcesFile, 'utf8')).map(
	({ slug, entries }) => ({
		slug,
		entries: entries.map(({ name, value }) => ({ name, value })),
	}),
);

writeFileSync(
	new URL('./fixtures.data.json', import.meta.url),
	`${JSON.stringify({ stories, datasources })}\n`,
);
console.log(
	`fixtures: ${stories.length} stories, ${datasources.length} datasources`,
);
