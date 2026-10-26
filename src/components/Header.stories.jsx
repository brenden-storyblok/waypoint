import { story } from '../../.storybook/fixtures';
import Header from './Header';

const header = story('global/header').content;

/** The site bar: wordmark or logo, nav links and a call-to-action Button. */
const meta = {
	title: 'Site/Header',
	component: Header,
	parameters: { layout: 'fullscreen' },
};

export default meta;

export const Default = {
	args: { blok: header },
};

export const WithoutCta = {
	args: { blok: { ...header, cta: [] } },
};

/** Below the md Breakpoint the nav hides; the CTA shows from sm up. */
export const Narrow = {
	args: { blok: header },
	globals: { viewport: { value: 'mobile1', isRotated: false } },
};
