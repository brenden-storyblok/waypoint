import {
	storyblokEditable,
	StoryblokServerComponent,
} from '@storyblok/react/rsc';
import './Section.css';

const BACKGROUNDS = ['surface', 'inverse', 'accent'];
const PADDINGS = ['none', 'compact', 'default', 'spacious'];

const Section = ({ blok, ...forwardedProps }) => {
	const background = BACKGROUNDS.includes(blok.background)
		? blok.background
		: null;
	const padding = PADDINGS.includes(blok.padding) ? blok.padding : 'default';
	const fullBleed = Boolean(blok.full_bleed);
	const sectionClasses = [
		'section',
		background && `section--bg-${background}`,
		fullBleed && 'section--full-bleed',
		`section--pad-${padding}`,
	]
		.filter(Boolean)
		.join(' ');
	const innerClasses = fullBleed ? 'section__inner' : 'section__inner wp-wrap';

	return (
		<section {...storyblokEditable(blok)} className={sectionClasses}>
			<div className={innerClasses}>
				{blok.headline && (
					<h2 className="section__headline wp-section-title">
						{blok.headline}
					</h2>
				)}
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
