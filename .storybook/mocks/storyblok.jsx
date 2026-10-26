// Stands in for @storyblok/react/rsc in Storybook (aliased in main.js), so
// components render from fixtures with no Delivery API or Visual Editor.
// Covers what the spike stories need; nested bloks and the fake API client
// arrive with the rest of the stories (.scratch/storybook/PLAN.md, step 3).
import { StoryblokRichText } from '@storyblok/react';

/** The Visual Editor attributes; nothing to connect to in Storybook. */
export const storyblokEditable = () => ({});

/** Rich text renders with the SDK's browser renderer. */
export const StoryblokServerRichText = StoryblokRichText;

export const StoryblokServerComponent = ({ blok }) => {
	throw new Error(
		`Storybook cannot render nested bloks yet (got "${blok?.component}")`,
	);
};
