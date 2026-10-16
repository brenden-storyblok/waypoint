import {
	storyblokEditable,
	StoryblokServerRichText,
} from '@storyblok/react/rsc';
import { RICH_TEXT_CLASSES } from './richTextClasses';

const TextBlock = ({ blok }) => (
	<section {...storyblokEditable(blok)} className="py-18">
		<div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-gutter md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-12">
			{blok.headline && (
				<h2 className="font-display text-display leading-[1.05] font-extrabold tracking-[-0.01em] text-balance">
					{blok.headline}
				</h2>
			)}
			{blok.text && (
				<div className={RICH_TEXT_CLASSES}>
					<StoryblokServerRichText document={blok.text} />
				</div>
			)}
		</div>
	</section>
);

export default TextBlock;
