import { beforeEach, describe, expect, it, vi } from 'vitest';

const lang = vi.fn();
vi.mock('next/root-params', () => ({ lang }));

const getLabel = vi.fn();
vi.mock('@/lib/labels', () => ({ getLabel }));

vi.mock('next/font/google', () => {
	const font = () => ({ variable: 'font-variable' });
	return {
		Bricolage_Grotesque: font,
		Source_Serif_4: font,
		JetBrains_Mono: font,
	};
});
vi.mock('next/navigation', () => ({ notFound: vi.fn() }));
vi.mock('@storyblok/react/rsc', () => ({ StoryblokServerComponent: vi.fn() }));
vi.mock('@/lib/content', () => ({ getGlobalStories: vi.fn() }));
vi.mock('../globals.css', () => ({}));

const { generateMetadata } = await import('./layout');

beforeEach(() => {
	lang.mockResolvedValue('en');
	getLabel.mockImplementation(async (key) => `${key}:${await lang()}`);
});

describe('generateMetadata', () => {
	it('gives every page, 404s included, a title and description from UI Labels in the current Language', async () => {
		lang.mockResolvedValue('fr');
		const metadata = await generateMetadata();
		expect(metadata.title).toBe('site-title:fr');
		expect(metadata.description).toBe('site-description:fr');
	});

	describe('metadataBase', () => {
		const originFor = async (env) => {
			for (const [name, value] of Object.entries(env)) vi.stubEnv(name, value);
			const { metadataBase } = await generateMetadata();
			vi.unstubAllEnvs();
			return metadataBase.href;
		};
		const vercelHosts = {
			VERCEL_PROJECT_PRODUCTION_URL: 'waypoint.example.com',
			VERCEL_URL: 'waypoint-abc123.vercel.app',
		};

		it('uses the production domain on Vercel production deploys', async () => {
			expect(
				await originFor({ ...vercelHosts, VERCEL_ENV: 'production' }),
			).toBe('https://waypoint.example.com/');
		});

		it('uses the deployment URL on Vercel previews', async () => {
			expect(await originFor({ ...vercelHosts, VERCEL_ENV: 'preview' })).toBe(
				'https://waypoint-abc123.vercel.app/',
			);
		});

		it('falls back to localhost outside Vercel', async () => {
			expect(
				await originFor({
					VERCEL_ENV: '',
					VERCEL_URL: '',
					VERCEL_PROJECT_PRODUCTION_URL: '',
				}),
			).toBe('http://localhost:3000/');
		});
	});
});
