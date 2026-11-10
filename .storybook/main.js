import { fileURLToPath } from 'node:url';

/** @type { import('@storybook/nextjs-vite').StorybookConfig } */
const config = {
	framework: '@storybook/nextjs-vite',
	stories: ['../src/**/*.stories.jsx'],
	// Wraps each story in Suspense, so async Server Components render.
	features: { experimentalRSC: true },
	// next/root-params only resolves in the Next compiler; stub it here.
	viteFinal: (viteConfig) => ({
		...viteConfig,
		resolve: {
			...viteConfig.resolve,
			alias: {
				...viteConfig.resolve?.alias,
				'next/root-params': fileURLToPath(
					new URL('./rootParams.js', import.meta.url),
				),
			},
		},
	}),
};

export default config;
