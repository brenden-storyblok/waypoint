import {
	storyblokEditable,
	StoryblokServerComponent,
} from '@storyblok/react/rsc';
import { pickFrom } from '@/lib/pickFrom';

// Each editor option maps to complete class strings so Tailwind's scanner
// generates them. Every color carries its dark-mode partner (ADR 0002).
const BACKGROUND_CLASSES = {
	surface: 'bg-white dark:bg-deep-sea-800',
	inverse:
		'bg-deep-sea-900 text-frost-100 dark:bg-frost-200 dark:text-deep-sea-950',
	accent: 'bg-lagoon-700 text-white dark:bg-lagoon-300 dark:text-deep-sea-950',
};

const PADDING_CLASSES = {
	none: 'py-0',
	compact: 'py-9',
	default: 'py-18',
	spacious: 'py-27',
};

// A side headline shares a row with the body: one column below md, then the
// headline takes 1fr and the body 2fr. The headline stays first in the markup
// so screen readers reach it first; end mode moves it to the right column.
const SIDE_LAYOUT_CLASSES = {
	start: {
		inner: 'md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]',
		headline: '',
		body: '',
	},
	end: {
		inner: 'md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]',
		headline: 'md:col-start-2 md:row-start-1',
		body: 'md:col-start-1 md:row-start-1',
	},
};

const CONTENT_WIDTH_CLASSES = 'mx-auto max-w-7xl px-gutter';
const SPLIT_CLASSES = 'grid grid-cols-1 items-center gap-6 md:gap-12';
const HEADLINE_TYPE_CLASSES =
	'font-display text-display leading-[1.05] font-extrabold tracking-[-0.01em] text-balance';

const pickBackground = pickFrom(Object.keys(BACKGROUND_CLASSES));
const pickPadding = pickFrom(Object.keys(PADDING_CLASSES));
const pickHeadlinePosition = pickFrom(['top', 'start', 'end']);

const joinClasses = (...classNames) => classNames.filter(Boolean).join(' ');

const Section = ({ blok, ...forwardedProps }) => {
	const background = pickBackground(blok.background);
	const padding = pickPadding(blok.padding) ?? 'default';
	const headlinePosition =
		pickHeadlinePosition(blok.headline_position) ?? 'top';
	const sideLayout = SIDE_LAYOUT_CLASSES[headlinePosition];
	const fullBleed = Boolean(blok.full_bleed);

	// A side headline and its body both keep the content width. Otherwise full
	// bleed spans only the body across the viewport, and the headline keeps the
	// content width and page gutter.
	const innerClassName = sideLayout
		? joinClasses(CONTENT_WIDTH_CLASSES, SPLIT_CLASSES, sideLayout.inner)
		: fullBleed
			? undefined
			: CONTENT_WIDTH_CLASSES;
	const headlineClassName = joinClasses(
		HEADLINE_TYPE_CLASSES,
		sideLayout ? sideLayout.headline : 'mb-8',
		fullBleed && !sideLayout && CONTENT_WIDTH_CLASSES,
	);
	const nestedBloks = blok.body?.map((nestedBlok) => (
		<StoryblokServerComponent
			blok={nestedBlok}
			key={nestedBlok._uid}
			{...forwardedProps}
		/>
	));

	return (
		<section
			{...storyblokEditable(blok)}
			className={joinClasses(
				BACKGROUND_CLASSES[background],
				PADDING_CLASSES[padding],
			)}
		>
			<div className={innerClassName}>
				{blok.headline && (
					<h2 className={headlineClassName}>{blok.headline}</h2>
				)}
				{sideLayout ? (
					<div className={sideLayout.body || undefined}>{nestedBloks}</div>
				) : (
					nestedBloks
				)}
			</div>
		</section>
	);
};

export default Section;
