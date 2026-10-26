import { bloks, destination } from '../../.storybook/fixtures';
import DestinationUsps from './DestinationUsps';

const lisbon = destination('lisbon');
const amsterdam = destination('amsterdam');
const uspsBlok = (slug) => bloks(`destinations/${slug}`, 'destination_usps')[0];

/** A row of up to four short selling points about a Destination, under a headline. */
const meta = {
	title: 'Destinations/DestinationUsps',
	component: DestinationUsps,
};

export default meta;

export const Lisbon = {
	args: { blok: uspsBlok('lisbon'), destination: lisbon },
};

export const Amsterdam = {
	args: { blok: uspsBlok('amsterdam'), destination: amsterdam },
};

export const NoHeadline = {
	args: {
		blok: { ...uspsBlok('lisbon'), headline: '' },
		destination: lisbon,
	},
};

/** Fewer than four items still fill the row from the left. */
export const TwoItems = {
	args: {
		blok: uspsBlok('amsterdam'),
		destination: { ...amsterdam, usps: amsterdam.usps.slice(0, 2) },
	},
};
