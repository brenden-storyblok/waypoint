import { apiPlugin } from '@storyblok/react/rsc';

/** Init options both the server and the browser SDK share. */
export const storyblokConfig = {
	accessToken: process.env.STORYBLOK_DELIVERY_API_TOKEN,
	use: [apiPlugin],
	apiOptions: {
		/** Set the correct region for your space. Learn more: https://www.storyblok.com/docs/packages/storyblok-js#example-region-parameter */
		region: process.env.STORYBLOK_REGION || 'eu',
		/** The following code is only required when creating a Storyblok space directly via the Blueprints feature. */
		endpoint: process.env.STORYBLOK_API_BASE_URL
			? `${new URL(process.env.STORYBLOK_API_BASE_URL).origin}/v2`
			: undefined,
	},
};
