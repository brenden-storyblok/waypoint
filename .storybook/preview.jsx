import './fonts.css';
import '../src/app/globals.css';
import SiteRoot from '../.design-sync/SiteRoot';
// Registers every block with the SDK, as the app does.
import '../src/lib/storyblok';

/** @type { import('@storybook/nextjs-vite').Preview } */
const preview = {
	decorators: [
		(Story) => (
			<SiteRoot>
				<Story />
			</SiteRoot>
		),
	],
	parameters: {
		layout: 'padded',
		nextjs: { appDirectory: true },
	},
};

export default preview;
