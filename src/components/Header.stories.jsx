import { destination, story } from '../../.storybook/fixtures';
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

/** The switcher marks the Language the page is in; below md it shows only the code. */
export const InGerman = {
	args: { blok: header, language: 'de' },
};

export const WithoutCta = {
	args: { blok: { ...header, cta: [] } },
};

const logoSvg =
	"<svg xmlns='http://www.w3.org/2000/svg' width='400' height='100'><rect width='400' height='100' rx='12' fill='#0f766e'/><text x='200' y='66' font-size='48' font-family='sans-serif' fill='white' text-anchor='middle'>waypoint</text></svg>";

/** A raster logo from a fixture image asset: the loader resizes it and its `meta_data.size` sets the width. */
export const WithLogo = {
	args: {
		blok: { ...header, logo: destination('lisbon').hero_image },
	},
};

/** An SVG logo keeps its original URL; the `#.svg` suffix marks the data URI as SVG for the passthrough. */
export const WithSvgLogo = {
	args: {
		blok: {
			...header,
			logo: {
				filename: `data:image/svg+xml,${encodeURIComponent(logoSvg)}#.svg`,
				alt: 'Waypoint',
				meta_data: { size: '400x100' },
			},
		},
	},
};

/** Below the md Breakpoint the nav hides; the CTA shows from sm up. */
export const Narrow = {
	args: { blok: header },
	globals: { viewport: { value: 'mobile1', isRotated: false } },
};
