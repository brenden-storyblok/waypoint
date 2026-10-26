import { bloks } from '../../.storybook/fixtures';
import TextBlock from './TextBlock';

const [whoWeAre] = bloks('about', 'text_block');
const [gettingAround] = bloks('destinations/lisbon', 'text_block');

/** A headline beside a column of rich text, stacked below md. */
const meta = {
	title: 'Page/TextBlock',
	component: TextBlock,
	parameters: { layout: 'fullscreen' },
};

export default meta;

export const Default = {
	args: { blok: whoWeAre },
};

/** Destination Pages end with the same block, written per Destination. */
export const OnDestinationPage = {
	args: { blok: gettingAround },
};

export const WithoutHeadline = {
	args: { blok: { ...whoWeAre, headline: '' } },
};
