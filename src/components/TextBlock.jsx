import {
	storyblokEditable,
	StoryblokServerRichText,
} from '@storyblok/react/rsc';
import './TextBlock.css';

const TextBlock = ({ blok }) => (
	<section {...storyblokEditable(blok)} className="text-block wp-section">
		<div className="wp-wrap wp-split">
			{blok.headline && <h2 className="wp-section-title">{blok.headline}</h2>}
			{blok.text && (
				<div className="text-block__body wp-rich">
					<StoryblokServerRichText document={blok.text} />
				</div>
			)}
		</div>
	</section>
);

export default TextBlock;
