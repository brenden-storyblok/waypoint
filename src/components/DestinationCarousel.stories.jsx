import {
	bloks,
	datasourceLabels,
	destinationPageHref,
} from '../../.storybook/fixtures';
import { countryName } from '@/lib/countryName';
import DestinationCard from './DestinationCard';
import DestinationCarousel from './DestinationCarousel';

const [grid] = bloks('home', 'destination_grid');

const countries = datasourceLabels('countries');

const cardFor = (destination) => (
	<DestinationCard
		key={destination.uuid}
		destination={destination}
		href={destinationPageHref(destination.uuid)}
		countryLabel={countryName(countries, destination.content.country)}
		exploreTemplate="Explore {name}"
	/>
);

// The English ui-labels the grid reads on the server.
const labels = {
	label: 'Destinations',
	roleDescription: 'carousel',
	previousLabel: 'Previous destinations',
	nextLabel: 'Next destinations',
};

/** A Pool's Destinations in one row that visitors swipe through. Always the whole Pool. */
const meta = {
	title: 'Search/DestinationCarousel',
	component: DestinationCarousel,
};

export default meta;

/** More cards than fit: the Previous and Next arrows show. */
export const Overflowing = {
	args: {
		...labels,
		headline: grid.headline,
		placesLabel: `${grid.destinations.length} places`,
		children: grid.destinations.map(cardFor),
	},
};

/** Every card fits, so the arrows stay hidden. */
export const Fits = {
	args: {
		...labels,
		headline: grid.headline,
		placesLabel: '2 places',
		children: grid.destinations.slice(0, 2).map(cardFor),
	},
};
