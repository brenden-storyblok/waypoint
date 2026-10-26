import { bloks } from '../../.storybook/fixtures';
import FaqSection from './FaqSection';

const [helpFaqs] = bloks('help', 'faq_section');
const [lisbonFaqs] = bloks('destinations/lisbon', 'faq_section');

/** A headline beside question-and-answer disclosures. The first answer starts open. */
const meta = {
	title: 'Page/FaqSection',
	component: FaqSection,
	parameters: { layout: 'fullscreen' },
};

export default meta;

export const Help = {
	args: { blok: helpFaqs },
};

export const OnDestinationPage = {
	args: { blok: lisbonFaqs },
};

export const SingleQuestion = {
	args: { blok: { ...lisbonFaqs, faqs: lisbonFaqs.faqs.slice(0, 1) } },
};
