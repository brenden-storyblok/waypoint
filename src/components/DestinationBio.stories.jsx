import { bloks, destination } from '../../.storybook/fixtures';
import DestinationBio from './DestinationBio';

const lisbon = destination('lisbon');
const amsterdam = destination('amsterdam');
const bioBlok = (slug) => bloks(`destinations/${slug}`, 'destination_bio')[0];

/** A headline beside a Destination's rich text description. */
const meta = {
	title: 'Destinations/DestinationBio',
	component: DestinationBio,
};

export default meta;

export const Lisbon = {
	args: { blok: bioBlok('lisbon'), destination: lisbon },
};

export const Amsterdam = {
	args: { blok: bioBlok('amsterdam'), destination: amsterdam },
};

/** Only the headline shows. */
export const NoDescription = {
	args: {
		blok: bioBlok('lisbon'),
		destination: { ...lisbon, description: null },
	},
};
