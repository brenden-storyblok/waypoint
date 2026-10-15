import Link from 'next/link';
import './Footer.css';
import {
	storyblokEditable,
	StoryblokServerComponent,
} from '@storyblok/react/rsc';

const Footer = ({ blok }) => (
	<footer {...storyblokEditable(blok)} className="site-footer">
		<div className="wp-wrap">
			<div className="site-footer__cols">
				<Link className="site-footer__logo" href="/">
					way<span>point</span>
				</Link>
				{(blok.columns || []).map((column) => (
					<StoryblokServerComponent blok={column} key={column._uid} />
				))}
			</div>
			{blok.legal_text && (
				<p className="site-footer__legal">{blok.legal_text}</p>
			)}
		</div>
	</footer>
);

export default Footer;
