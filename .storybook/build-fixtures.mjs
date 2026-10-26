// Writes .storybook/fixtures.data.json from the CLI pull in
// .storyblok/stories/source. Stories import the JSON, so both Storybook (Vite)
// and the /design-sync converter (esbuild) compile them; neither supports the
// other's glob import.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';

const sourceDir = new URL('../.storyblok/stories/source/', import.meta.url);

const stories = readdirSync(sourceDir)
	.filter((fileName) => fileName.endsWith('.json'))
	.sort()
	.map((fileName) => {
		const { uuid, name, full_slug, content } = JSON.parse(
			readFileSync(new URL(fileName, sourceDir), 'utf8'),
		);
		return { uuid, name, full_slug, content };
	});

writeFileSync(
	new URL('./fixtures.data.json', import.meta.url),
	`${JSON.stringify(stories)}\n`,
);
console.log(`fixtures: ${stories.length} stories`);
