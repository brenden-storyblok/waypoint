import {
	Bricolage_Grotesque,
	Source_Serif_4,
	JetBrains_Mono,
} from 'next/font/google';
import { notFound } from 'next/navigation';
import { StoryblokServerComponent } from '@storyblok/react/rsc';
import '../globals.css';
import { getStoryblokApi } from '@/lib/storyblok';
import { lang } from 'next/root-params';
import { getLabel } from '@/lib/labels';
import { LANGUAGES, deliveryLanguageParams, isLanguage } from '@/lib/language';

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

/** Loads the header and footer stories from the global/ folder in one request. */
async function getGlobalStories(language) {
	try {
		const { data } = await getStoryblokApi().get('cdn/stories', {
			version: 'draft',
			starts_with: 'global/',
			...deliveryLanguageParams(language),
		});
		const byComponent = Object.fromEntries(
			data.stories.map((story) => [story.content?.component, story]),
		);
		return { header: byComponent.header, footer: byComponent.footer };
	} catch (error) {
		console.error('Could not load global stories', error);
		return {};
	}
}

/** Only the four Languages are routes; any other first segment is a 404. */
export const dynamicParams = false;

export const generateStaticParams = () =>
	LANGUAGES.map(({ code }) => ({ lang: code }));

/**
 * The default title and description, UI Labels in the current Language. Pages
 * inherit them, and so do the 404 and error pages, which have no metadata of
 * their own.
 */
export async function generateMetadata() {
	return {
		title: await getLabel('site-title'),
		description: await getLabel('site-description'),
	};
}

export default async function RootLayout({ children }) {
	const language = await lang();
	if (!isLanguage(language)) notFound();
	const { header, footer } = await getGlobalStories(language);

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
