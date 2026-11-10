import {
	bloks,
	datasourceLabels,
	destinationPageHref,
	story,
} from '../../.storybook/fixtures';
import { countryName } from '@/lib/countryName';
import DestinationCard from './DestinationCard';
import DestinationCarousel from './DestinationCarousel';

const lisbon = story('data/destinations/lisbon');

// The English UI copy the grid hands each card from the server.
const countries = datasourceLabels('countries');
const exploreTemplate = 'Explore {name}';
const countryLabel = (destination) =>
	countryName(countries, destination.content.country);

/** One Destination as a 4:5 photo, its name and Country. */
const meta = {
	title: 'Destinations/DestinationCard',
	component: DestinationCard,
	decorators: [
		(Story, context) =>
			context.parameters.fullWidth ? (
				<Story />
			) : (
				<div className="max-w-sm">
					<Story />
				</div>
			),
	],
};

export default meta;

/** With a Destination Page: the link line shows and the card reacts to hover. */
export const Linked = {
	args: {
		destination: lisbon,
		href: '/destinations/lisbon',
		countryLabel: countryLabel(lisbon),
		exploreTemplate,
	},
};

export const Unlinked = {
	args: { destination: lisbon, countryLabel: countryLabel(lisbon) },
};

/** The placeholder fill shows while a photo loads or when none is set. */
export const NoImage = {
	args: {
		destination: {
			...lisbon,
			content: { ...lisbon.content, hero_image: null },
		},
		countryLabel: countryLabel(lisbon),
	},
};

/** The same card inside the Carousel, a Client Component: the image still gets its srcset. */
export const InCarousel = {
	parameters: { fullWidth: true },
	render: () => {
		const [grid] = bloks('home', 'destination_grid');
		return (
			<DestinationCarousel
				headline={grid.headline}
				placesLabel={`${grid.destinations.length} places`}
				roleDescription="carousel"
			>
				{grid.destinations.map((destination) => (
					<DestinationCard
						key={destination.uuid}
						destination={destination}
						href={destinationPageHref(destination.uuid)}
						countryLabel={countryLabel(destination)}
						exploreTemplate={exploreTemplate}
					/>
				))}
			</DestinationCarousel>
		);
	},
};
