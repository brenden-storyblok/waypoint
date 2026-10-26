import { bloks, destination } from '../../.storybook/fixtures';
import DestinationGallery from './DestinationGallery';

const lisbon = destination('lisbon');
const amsterdam = destination('amsterdam');
const galleryBlok = (slug) =>
	bloks(`destinations/${slug}`, 'destination_gallery')[0];

/** A bento grid of a Destination's photos, each tile sized from its aspect ratio. */
const meta = {
	title: 'Destinations/DestinationGallery',
	component: DestinationGallery,
};

export default meta;

export const Lisbon = {
	args: { blok: galleryBlok('lisbon'), destination: lisbon },
};

/** Six photos, one more than most Destinations. */
export const Amsterdam = {
	args: { blok: galleryBlok('amsterdam'), destination: amsterdam },
};

export const NoHeadline = {
	args: {
		blok: { ...galleryBlok('lisbon'), headline: '' },
		destination: lisbon,
	},
};

/** The count reads "1 image". */
export const SingleImage = {
	args: {
		blok: galleryBlok('lisbon'),
		destination: { ...lisbon, gallery: lisbon.gallery.slice(0, 1) },
	},
};

/** Only the headline shows. */
export const NoImages = {
	args: {
		blok: galleryBlok('lisbon'),
		destination: { ...lisbon, gallery: [] },
	},
};

/** The photos show without credits. */
export const NoCredits = {
	args: {
		blok: galleryBlok('amsterdam'),
		destination: {
			...amsterdam,
			gallery: amsterdam.gallery.map((asset) => ({ ...asset, copyright: '' })),
		},
	},
};
