// Props contracts for the components in entry.js. Waypoint's components are
// plain JS, so /design-sync reads these instead of compiled types; Claude
// Design codes against them. Keep each interface in step with its component.
import type { ReactElement } from 'react';

/** A Storyblok multilink field value. Story links resolve through cached_url. */
export interface StoryblokLink {
	linktype: 'story' | 'url' | 'email' | 'asset';
	url?: string;
	cached_url?: string;
	email?: string;
	anchor?: string;
}

/** A Storyblok asset field value. */
export interface StoryblokAsset {
	/** The a.storyblok.com URL. Components request resized webp copies of it. */
	filename: string;
	alt?: string;
	/** Shown as the photo credit, prefixed with "©". */
	copyright?: string;
}

export interface SiteRootProps {
	children?: unknown;
}

/** The page root: mist background, serif body copy and ink colour in light and dark. Wrap every design in it once. */
export declare function SiteRoot(props: SiteRootProps): ReactElement;

export interface ButtonProps {
	/** The Storyblok `button` blok. */
	blok: {
		/** Defaults to primary. Use one primary Button per view. */
		variant?: 'primary' | 'secondary' | 'tertiary';
		label: string;
		link?: StoryblokLink;
	};
	/** "sm" in the Header and other compact rows; anything else renders regular. */
	size?: 'regular' | 'sm';
}

/** A pill-shaped link that starts an action. One primary Button per view. */
export declare function Button(props: ButtonProps): ReactElement;

export interface DestinationCardProps {
	/** A Destination story. The card reads `content.name` (falling back to `name`), `content.country` and `content.hero_image`. */
	destination: {
		name?: string;
		content?: {
			name?: string;
			/** Lowercase country value, e.g. "portugal". The card capitalises it. */
			country?: string;
			hero_image?: StoryblokAsset | null;
		};
	};
	/** The Destination Page's path. With it, the card links and reacts to hover. */
	href?: string;
}

/** One Destination as a 4:5 photo, its name and Country, linking to its Destination Page. */
export declare function DestinationCard(props: DestinationCardProps): ReactElement;
