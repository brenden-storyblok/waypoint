/** @type { import('@storybook/nextjs-vite').StorybookConfig } */
const config = {
	framework: '@storybook/nextjs-vite',
	stories: ['../src/**/*.stories.jsx'],
	// Wraps each story in Suspense, so async Server Components render.
	features: { experimentalRSC: true },
};

export default config;
