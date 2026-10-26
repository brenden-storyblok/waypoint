import { bloks, destination } from '../../.storybook/fixtures';
import DestinationHero from './DestinationHero';

const lisbon = destination('lisbon');
const amsterdam = destination('amsterdam');
const heroBlok = (slug) => bloks(`destinations/${slug}`, 'destination_hero')[0];

/** The full-bleed opening of a Destination Page: photo, region and Country, name and summary. */
const meta = {
	title: 'Destinations/DestinationHero',
	component: DestinationHero,
	parameters: { layout: 'fullscreen' },
};

export default meta;

export const Lisbon = {
	args: { blok: heroBlok('lisbon'), destination: lisbon },
};

export const Amsterdam = {
	args: { blok: heroBlok('amsterdam'), destination: amsterdam },
};

/** The summary line is left out. */
export const NoSummary = {
	args: {
		blok: heroBlok('lisbon'),
		destination: { ...lisbon, summary: '' },
	},
};

/** Only the Country shows above the name. */
export const NoRegion = {
	args: {
		blok: heroBlok('amsterdam'),
		destination: { ...amsterdam, region: '' },
	},
};

/** The placeholder fill shows, and so does no photo credit. */
export const NoImage = {
	args: {
		blok: heroBlok('lisbon'),
		destination: { ...lisbon, hero_image: null },
	},
};

/** The photo shows without its credit. */
export const NoCredit = {
	args: {
		blok: heroBlok('amsterdam'),
		destination: {
			...amsterdam,
			hero_image: { ...amsterdam.hero_image, copyright: '' },
		},
	},
};
