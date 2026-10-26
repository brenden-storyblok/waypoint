import { fileURLToPath } from 'node:url';
import { mergeConfig } from 'vite';

const fromRoot = (path) => fileURLToPath(new URL(path, import.meta.url));

/** @type { import('@storybook/nextjs-vite').StorybookConfig } */
const config = {
	framework: '@storybook/nextjs-vite',
	stories: ['../src/**/*.stories.jsx'],
	viteFinal: (viteConfig) =>
		mergeConfig(viteConfig, {
			resolve: {
				alias: [
					// Components render from fixtures, never the Delivery API.
					{
						find: /^@storyblok\/react\/rsc$/,
						replacement: fromRoot('./mocks/storyblok.jsx'),
					},
					{ find: /^@\//, replacement: `${fromRoot('../src')}/` },
				],
			},
		}),
};

export default config;
