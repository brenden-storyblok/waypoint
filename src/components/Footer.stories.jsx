import { story } from '../../.storybook/fixtures';
import Footer from './Footer';

const footer = story('global/footer').content;

/** The site's closing band: wordmark, link columns and legal text. */
const meta = {
	title: 'Site/Footer',
	component: Footer,
	parameters: { layout: 'fullscreen' },
};

export default meta;

export const Default = {
	args: { blok: footer },
};

export const WithoutLegalText = {
	args: { blok: { ...footer, legal_text: '' } },
};
