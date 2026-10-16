import {
	Bricolage_Grotesque,
	Source_Serif_4,
	JetBrains_Mono,
} from 'next/font/google';
import { StoryblokServerComponent } from '@storyblok/react/rsc';
import './globals.css';
import StoryblokProvider from '@/components/StoryblokProvider';
import { getStoryblokApi } from '@/lib/storyblok';

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

export const metadata = {
	title: 'Waypoint',
	description: 'European destinations our editors keep going back to.',
};

/** Loads the header and footer stories from the global/ folder in one request. */
async function getGlobalStories() {
	try {
		const { data } = await getStoryblokApi().get('cdn/stories', {
			version: 'draft',
			starts_with: 'global/',
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

export default async function RootLayout({ children }) {
	const { header, footer } = await getGlobalStories();

	return (
		<StoryblokProvider>
			<html
				lang="en"
				className={`${display.variable} ${serif.variable} ${mono.variable} scheme-light-dark motion-safe:scroll-smooth`}
			>
				<head>
					<meta name="robots" content="noindex, nofollow" />
					<meta name="title" content="Waypoint" />
					<meta
						name="description"
						content="European destinations our editors keep going back to."
					/>
					<meta
						name="keywords"
						content="European destinations, travel, travel planning, travel tips, travel inspiration, travel guides, travel destinations, travel destinations in Europe, travel destinations in the world, travel destinations in the USA, travel destinations in Asia, travel destinations in Africa, travel destinations in South America, travel destinations in North America, travel destinations in Europe, travel destinations in the world, travel destinations in the USA, travel destinations in Asia, travel destinations in Africa, travel destinations in South America, travel destinations in North America"
					/>
					<meta name="author" content="Waypoint" />
					<meta
						name="viewport"
						content="width=device-width, initial-scale=1.0"
					/>
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
		</StoryblokProvider>
	);
}
