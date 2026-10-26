import { bloks } from '../../.storybook/fixtures';
import Button from './Button';

const buttonLabelled = (fullSlug, label) =>
	bloks(fullSlug, 'button').find((blok) => blok.label === label);

/** A pill-shaped link that starts an action. One primary Button per view. */
const meta = {
	title: 'Actions/Button',
	component: Button,
	argTypes: {
		size: { control: 'inline-radio', options: ['regular', 'sm'] },
	},
};

export default meta;

export const Primary = {
	args: { blok: buttonLabelled('home', 'Find a destination') },
};

export const Secondary = {
	args: { blok: buttonLabelled('home', 'Get Inspired') },
};

export const Tertiary = {
	args: { blok: buttonLabelled('home', 'How we pick') },
};

/** The Header passes size "sm". */
export const Small = {
	args: { blok: buttonLabelled('global/header', 'Plan a trip'), size: 'sm' },
};
