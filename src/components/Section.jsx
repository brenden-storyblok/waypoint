import {
	storyblokEditable,
	StoryblokServerComponent,
} from '@storyblok/react/rsc';
import { pickFrom } from '@/lib/pickFrom';
import './Section.css';

const pickBackground = pickFrom(['surface', 'inverse', 'accent']);
const pickPadding = pickFrom(['none', 'compact', 'default', 'spacious']);
const pickHeadlinePosition = pickFrom(['top', 'start', 'end']);

const Section = ({ blok, ...forwardedProps }) => {
	const background = pickBackground(blok.background);
	const padding = pickPadding(blok.padding) ?? 'default';
	const headlinePosition =
		pickHeadlinePosition(blok.headline_position) ?? 'top';
	const sideHeadline = headlinePosition !== 'top';
	const fullBleed = Boolean(blok.full_bleed);
	const sectionClasses = [
		'section',
		background && `section--bg-${background}`,
		`section--pad-${padding}`,
	]
		.filter(Boolean)
		.join(' ');
	// A start or end headline shares a row with the body, so both keep the content
	// width. Otherwise full bleed spans only the body across the viewport and
	// the headline keeps the content width and page gutter.
	const innerClasses = sideHeadline
		? `section__inner section__inner--${headlinePosition} wp-wrap wp-split`
		: fullBleed
			? 'section__inner'
			: 'section__inner wp-wrap';
	const headlineClasses =
		fullBleed && !sideHeadline
			? 'section__headline wp-section-title wp-wrap'
			: 'section__headline wp-section-title';
	const nestedBloks = blok.body?.map((nestedBlok) => (
		<StoryblokServerComponent
			blok={nestedBlok}
			key={nestedBlok._uid}
			{...forwardedProps}
		/>
	));

	return (
		<section {...storyblokEditable(blok)} className={sectionClasses}>
			<div className={innerClasses}>
				{blok.headline && <h2 className={headlineClasses}>{blok.headline}</h2>}
				{sideHeadline ? (
					<div className="section__body">{nestedBloks}</div>
				) : (
					nestedBloks
				)}
			</div>
		</section>
	);
};

export default Section;
