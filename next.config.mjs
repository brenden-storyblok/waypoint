/** @type {import('next').NextConfig} */
const nextConfig = {
	// Each <Image> brings its own Storyblok loader, so no loaderFile or remotePatterns.
	images: { qualities: [75] },
	// The following environment variables can be safely exposed to the public bundle.
	// The Storyblok public access token is required for features like live preview.
	env: {
		STORYBLOK_DELIVERY_API_TOKEN: process.env.STORYBLOK_DELIVERY_API_TOKEN,
		STORYBLOK_API_BASE_URL: process.env.STORYBLOK_API_BASE_URL,
		STORYBLOK_REGION: process.env.STORYBLOK_REGION,
	},
};

export default nextConfig;
