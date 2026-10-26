import { bloks, destinationPageHref } from '../../.storybook/fixtures';
import DestinationCard from './DestinationCard';
import DestinationCarousel from './DestinationCarousel';

const [grid] = bloks('home', 'destination_grid');

const cardFor = (destination) => (
	<DestinationCard
		key={destination.uuid}
		destination={destination}
		href={destinationPageHref(destination.uuid)}
	/>
);

/** A Pool's Destinations in one row that visitors swipe through. Always the whole Pool. */
const meta = {
	title: 'Search/DestinationCarousel',
	component: DestinationCarousel,
};

export default meta;

/** More cards than fit: the Previous and Next arrows show. */
export const Overflowing = {
	args: {
		headline: grid.headline,
		placesLabel: `${grid.destinations.length} places`,
		children: grid.destinations.map(cardFor),
	},
};

/** Every card fits, so the arrows stay hidden. */
export const Fits = {
	args: {
		headline: grid.headline,
		placesLabel: '2 places',
		children: grid.destinations.slice(0, 2).map(cardFor),
	},
};
