import { Bricolage_Grotesque, Source_Serif_4, JetBrains_Mono } from 'next/font/google';
import { StoryblokServerComponent } from '@storyblok/react/rsc';
import './globals.css';
import StoryblokProvider from '@/components/StoryblokProvider';
import { getStoryblokApi } from '@/lib/storyblok';

const display = Bricolage_Grotesque({
	subsets: ['latin'],
	weight: ['400', '600', '800'],
	variable: '--font-display',
});
const body = Source_Serif_4({
	subsets: ['latin'],
	weight: ['400', '600'],
	style: ['normal', 'italic'],
	variable: '--font-body',
});
const mono = JetBrains_Mono({
	subsets: ['latin'],
	weight: ['400', '600'],
	variable: '--font-mono',
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
			<html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
				<body>
					{header && <StoryblokServerComponent blok={header.content} />}
					{children}
					{footer && <StoryblokServerComponent blok={footer.content} />}
				</body>
			</html>
		</StoryblokProvider>
	);
}
