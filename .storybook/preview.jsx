import './fonts.css';
import '../src/app/globals.css';
import SiteRoot from '../.design-sync/SiteRoot';

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
