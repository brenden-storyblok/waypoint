import './fonts.css';
import '../src/app/globals.css';
// Registers every block with the SDK, as the app does.
import '../src/lib/storyblok';

/** @type { import('@storybook/nextjs-vite').Preview } */
const preview = {
	decorators: [
		// The page defaults src/app/layout.js sets on <html> and <body>, which
		// Storybook doesn't render: background, serif body copy at text-lg, ink
		// colour, both colour schemes.
		(Story) => (
			<div className="scheme-light-dark min-h-screen bg-mist-50 font-serif text-lg leading-relaxed text-pretty text-deep-sea-900 antialiased dark:bg-deep-sea-950 dark:text-frost-200">
				<Story />
			</div>
		),
	],
	parameters: {
		layout: 'padded',
		nextjs: { appDirectory: true },
	},
};

export default preview;
