import {
	storyblokEditable,
	StoryblokServerComponent,
} from '@storyblok/react/rsc';
import { pickFrom } from '@/lib/pickFrom';
import './Section.css';

const pickBackground = pickFrom(['surface', 'inverse', 'accent']);
const pickPadding = pickFrom(['none', 'compact', 'default', 'spacious']);

const Section = ({ blok, ...forwardedProps }) => {
	const background = pickBackground(blok.background);
	const padding = pickPadding(blok.padding) ?? 'default';
	const fullBleed = Boolean(blok.full_bleed);
	const sectionClasses = [
		'section',
		background && `section--bg-${background}`,
		`section--pad-${padding}`,
	]
		.filter(Boolean)
		.join(' ');
	// Full bleed spans only the body across the viewport; the headline keeps
	// the content width and page gutter.
	const innerClasses = fullBleed ? 'section__inner' : 'section__inner wp-wrap';
	const headlineClasses = fullBleed
		? 'section__headline wp-section-title wp-wrap'
		: 'section__headline wp-section-title';

	return (
		<section {...storyblokEditable(blok)} className={sectionClasses}>
			<div className={innerClasses}>
				{blok.headline && <h2 className={headlineClasses}>{blok.headline}</h2>}
				{blok.body?.map((nestedBlok) => (
					<StoryblokServerComponent
						blok={nestedBlok}
						key={nestedBlok._uid}
						{...forwardedProps}
					/>
				))}
			</div>
		</section>
	);
};

export default Section;
