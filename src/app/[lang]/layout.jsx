import {
	Bricolage_Grotesque,
	Source_Serif_4,
	JetBrains_Mono,
} from 'next/font/google';
import { notFound } from 'next/navigation';
import { StoryblokServerComponent } from '@storyblok/react/rsc';
import '../globals.css';
import { getGlobalStories } from '@/lib/content';
import { lang } from 'next/root-params';
import { getLabel } from '@/lib/labels';
import { LANGUAGES, isLanguage } from '@/lib/language';

const display = Bricolage_Grotesque({
	subsets: ['latin'],
	weight: ['400', '600', '800'],
	variable: '--font-next-display',
});
const serif = Source_Serif_4({
	subsets: ['latin'],
	weight: ['400', '600'],
	style: ['normal', 'italic'],
	variable: '--font-next-serif',
});
const mono = JetBrains_Mono({
	subsets: ['latin'],
	weight: ['400', '600'],
	variable: '--font-next-mono',
});

/** The header and footer that load; the page renders without them on failure. */
async function loadGlobalStories(language) {
	try {
		return await getGlobalStories(language);
	} catch (error) {
		console.error('Could not load global stories', error);
		return {};
	}
}

/**
 * The site origin from Vercel's system env vars: the production domain on
 * production deploys, the deployment URL on previews, localhost elsewhere.
 * Vercel sets both hosts without a protocol.
 */
function siteOrigin() {
	const host =
		process.env.VERCEL_ENV === 'production'
			? process.env.VERCEL_PROJECT_PRODUCTION_URL
			: process.env.VERCEL_URL;
	return new URL(host ? `https://${host}` : 'http://localhost:3000');
}

// Cache Components rejects dynamicParams, so the layout below
// answers any first segment that is not a Language with notFound().
export const generateStaticParams = () =>
	LANGUAGES.map(({ code }) => ({ lang: code }));

/**
 * The default title and description, UI Labels in the current Language. Pages
 * inherit them, and so do the 404 and error pages, which have no metadata of
 * their own. `metadataBase` turns relative metadata URLs (hreflang alternates)
 * into full URLs on this deployment's origin.
 */
export async function generateMetadata() {
	return {
		metadataBase: siteOrigin(),
		title: await getLabel('site-title'),
		description: await getLabel('site-description'),
	};
}

export default async function RootLayout({ children }) {
	const language = await lang();
	if (!isLanguage(language)) notFound();
	const { header, footer } = await loadGlobalStories(language);

	return (
		<html
			lang={language}
			className={`${display.variable} ${serif.variable} ${mono.variable} scheme-light-dark motion-safe:scroll-smooth`}
		>
			<head>
				<meta name="robots" content="noindex, nofollow" />
				<meta
					name="keywords"
					content="European destinations, travel, travel planning, travel tips, travel inspiration, travel guides, travel destinations, travel destinations in Europe, travel destinations in the world, travel destinations in the USA, travel destinations in Asia, travel destinations in Africa, travel destinations in South America, travel destinations in North America, travel destinations in Europe, travel destinations in the world, travel destinations in the USA, travel destinations in Asia, travel destinations in Africa, travel destinations in South America, travel destinations in North America"
				/>
				<meta name="author" content="Waypoint" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<meta name="theme-color" content="#000000" />
				<meta name="apple-mobile-web-app-capable" content="yes" />
				<meta
					name="apple-mobile-web-app-status-bar-style"
					content="black-translucent"
				/>
				<meta name="apple-mobile-web-app-title" content="Waypoint" />
			</head>
			<body className="bg-mist-50 font-serif text-lg leading-relaxed text-pretty text-deep-sea-900 antialiased dark:bg-deep-sea-950 dark:text-frost-200">
				{header && <StoryblokServerComponent blok={header.content} />}
				{children}
				{footer && <StoryblokServerComponent blok={footer.content} />}
			</body>
		</html>
	);
}
