import { bloks } from '../../.storybook/fixtures';
import Section from './Section';

const sectionOn = (fullSlug, background) =>
	bloks(fullSlug, 'section').find((blok) => blok.background === background);

const accentSection = sectionOn('about', 'accent');
const inverseSection = sectionOn('about', 'inverse');
const surfaceSection = sectionOn('about', 'surface');
const [homeSection] = bloks('home', 'section');

/** A horizontal band that sets its own background and width, with an optional headline over its blocks. */
const meta = {
	title: 'Page/Section',
	component: Section,
	parameters: { layout: 'fullscreen' },
};

export default meta;

export const Accent = {
	args: { blok: accentSection },
};

export const Inverse = {
	args: { blok: inverseSection },
};

export const Surface = {
	args: { blok: surfaceSection },
};

/** No background: the band shows the page color. The headline sits above the blocks. */
export const HeadlineTop = {
	args: {
		blok: {
			...homeSection,
			background: '',
			headline_position: 'top',
			padding: 'default',
		},
	},
};

/** The headline moves to the right column; the blocks take the left. */
export const HeadlineEnd = {
	args: { blok: { ...homeSection, headline_position: 'end' } },
};

/** Full bleed lets the blocks span the viewport while the headline keeps the content width. Space-between pushes the buttons to the viewport edges. */
export const FullBleedSpacious = {
	args: {
		blok: {
			...homeSection,
			headline_position: 'top',
			body: [{ ...homeSection.body[0], flex_justify: 'space-between' }],
			full_bleed: true,
			padding: 'spacious',
		},
	},
};
