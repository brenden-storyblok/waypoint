import Page from '@/components/Page';
import Hero from '@/components/Hero';
import Button from '@/components/Button';
import TextBlock from '@/components/TextBlock';
import FaqSection from '@/components/FaqSection';
import DestinationPage from '@/components/DestinationPage';
import Section from '@/components/Section';
import Layout from '@/components/Layout';
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
import { storyblokInit } from '@storyblok/react/rsc';
import { storyblokConfig } from '@/lib/storyblokConfig';

/** Relations the Delivery API resolves into full stories in one request. */
export const RESOLVE_RELATIONS = [
	'destination_page.destination',
	'destination_grid.destinations',
	'faq_section.faqs',
];

export const getStoryblokApi = storyblokInit({
	...storyblokConfig,
	components: {
		page: Page,
		hero: Hero,
		button: Button,
		text_block: TextBlock,
		faq_section: FaqSection,
		destination_page: DestinationPage,
		section: Section,
		layout: Layout,
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
});
