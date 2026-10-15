import Page from '@/components/Page';
import Feature from '@/components/Feature';
import Grid from '@/components/Grid';
import Teaser from '@/components/Teaser';
import Hero from '@/components/Hero';
import Button from '@/components/Button';
import TextBlock from '@/components/TextBlock';
import FaqSection from '@/components/FaqSection';
import DestinationPage from '@/components/DestinationPage';
import DestinationHero from '@/components/DestinationHero';
import DestinationUsps from '@/components/DestinationUsps';
import UspItem from '@/components/UspItem';
import DestinationBio from '@/components/DestinationBio';
import DestinationGallery from '@/components/DestinationGallery';
import DestinationGrid from '@/components/DestinationGrid';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NavLink from '@/components/NavLink';
import FooterColumn from '@/components/FooterColumn';
import { apiPlugin, storyblokInit } from '@storyblok/react/rsc';

/** Relations the Delivery API resolves into full stories in one request. */
export const RESOLVE_RELATIONS = [
	'destination_page.destination',
	'destination_grid.destinations',
	'faq_section.faqs',
];

export const getStoryblokApi = storyblokInit({
	accessToken: process.env.STORYBLOK_DELIVERY_API_TOKEN,
	use: [apiPlugin],
	components: {
		page: Page,
		feature: Feature,
		grid: Grid,
		teaser: Teaser,
		hero: Hero,
		button: Button,
		text_block: TextBlock,
		faq_section: FaqSection,
		destination_page: DestinationPage,
		destination_hero: DestinationHero,
		destination_usps: DestinationUsps,
		usp_item: UspItem,
		destination_bio: DestinationBio,
		destination_gallery: DestinationGallery,
		destination_grid: DestinationGrid,
		header: Header,
		footer: Footer,
		nav_link: NavLink,
		footer_column: FooterColumn,
	},
	apiOptions: {
		/** Set the correct region for your space. Learn more: https://www.storyblok.com/docs/packages/storyblok-js#example-region-parameter */
		region: process.env.STORYBLOK_REGION || 'eu',
		/** The following code is only required when creating a Storyblok space directly via the Blueprints feature. */
		endpoint: process.env.STORYBLOK_API_BASE_URL
			? `${new URL(process.env.STORYBLOK_API_BASE_URL).origin}/v2`
			: undefined,
	},
});
