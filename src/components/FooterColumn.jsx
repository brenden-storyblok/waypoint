import './FooterColumn.css';
import {
	storyblokEditable,
	StoryblokServerComponent,
} from '@storyblok/react/rsc';

const FooterColumn = ({ blok }) => (
	<div {...storyblokEditable(blok)} className="footer-column">
		{blok.headline && <h3 className="footer-column__title">{blok.headline}</h3>}
		{(blok.links || []).map((nestedBlok) => (
			<StoryblokServerComponent blok={nestedBlok} key={nestedBlok._uid} />
		))}
	</div>
);

export default FooterColumn;
