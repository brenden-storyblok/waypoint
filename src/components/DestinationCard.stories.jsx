import { story } from '../../.storybook/fixtures';
import DestinationCard from './DestinationCard';

const lisbon = story('data/destinations/lisbon');

/** One Destination as a 4:5 photo, its name and Country. */
const meta = {
	title: 'Destinations/DestinationCard',
	component: DestinationCard,
	decorators: [
		(Story) => (
			<div className="max-w-sm">
				<Story />
			</div>
		),
	],
};

export default meta;

/** With a Destination Page: the link line shows and the card reacts to hover. */
export const Linked = {
	args: { destination: lisbon, href: '/destinations/lisbon' },
};

export const Unlinked = {
	args: { destination: lisbon },
};

/** The placeholder fill shows while a photo loads or when none is set. */
export const NoImage = {
	args: {
		destination: {
			...lisbon,
			content: { ...lisbon.content, hero_image: null },
		},
	},
};
