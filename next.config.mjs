/** @type {import('next').NextConfig} */
const nextConfig = {
	cacheComponents: true,
	cacheLife: {
		// Published Storyblok reads: a webhook invalidates by tag, the 15-minute
		// revalidate catches any webhook that never arrived.
		storyblok: { stale: 300, revalidate: 900, expire: 86400 },
	},
	// Each <Image> brings its own Storyblok loader, so no loaderFile or remotePatterns.
	images: { qualities: [75, 85] },
	// The following environment variables can be safely exposed to the public bundle.
	// The Storyblok public access token is required for features like live preview.
	env: {
		STORYBLOK_DELIVERY_API_TOKEN: process.env.STORYBLOK_DELIVERY_API_TOKEN,
		STORYBLOK_API_BASE_URL: process.env.STORYBLOK_API_BASE_URL,
		STORYBLOK_REGION: process.env.STORYBLOK_REGION,
	},
};

export default nextConfig;
