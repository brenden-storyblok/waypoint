import { bloks } from '../../.storybook/fixtures';
import Hero from './Hero';

const homeHero = bloks('home', 'hero')[0];
const helpHero = bloks('help', 'hero')[0];
const destinationsHero = bloks('destinations/', 'hero')[0];

/** The page opener: a headline, optional intro and buttons beside a photo, stacked below md. */
const meta = {
	title: 'Page/Hero',
	component: Hero,
	parameters: { layout: 'fullscreen' },
};

export default meta;

export const WithIntroAndButtons = {
	args: { blok: homeHero },
};

export const WithoutIntro = {
	args: { blok: { ...homeHero, intro: '' } },
};

export const WithoutButtons = {
	args: { blok: helpHero },
};

export const HeadlineOnly = {
	args: { blok: destinationsHero },
};

/** The placeholder fill shows where the photo would be. */
export const NoImage = {
	args: { blok: { ...homeHero, image: null } },
};
