import { destination } from '../../.storybook/fixtures';
import UspItem from './UspItem';

const [firstUsp] = destination('lisbon').usps;

/** One selling point: a short title and a line of supporting text. */
const meta = {
	title: 'Destinations/UspItem',
	component: UspItem,
	decorators: [
		(Story) => (
			<div className="max-w-xs">
				<Story />
			</div>
		),
	],
};

export default meta;

export const Default = {
	args: { blok: firstUsp },
};

export const NoText = {
	args: { blok: { ...firstUsp, text: '' } },
};
