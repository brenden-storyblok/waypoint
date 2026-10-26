import { destination } from '../../.storybook/fixtures';
import ImageCredit from './ImageCredit';

const { hero_image: heroImage } = destination('lisbon');

/** A "©" credit pinned to the bottom right corner of the nearest positioned parent. */
const meta = {
	title: 'Destinations/ImageCredit',
	component: ImageCredit,
	decorators: [
		(Story) => (
			<div className="relative h-48 w-full max-w-sm rounded-md bg-placeholder">
				<Story />
			</div>
		),
	],
};

export default meta;

export const Default = {
	args: { asset: heroImage },
};

/** The credit truncates to the width of its parent. */
export const LongCredit = {
	args: {
		asset: {
			...heroImage,
			copyright:
				'Aleksandr Zaitsev / Unsplash, courtesy of the Lisbon Tourism Board and partners',
		},
	},
};

/** With no copyright text the component renders nothing. */
export const NoCredit = {
	args: { asset: { ...heroImage, copyright: '' } },
};
