import Link from 'next/link';
import './Header.css';
import {
	storyblokEditable,
	StoryblokServerComponent,
} from '@storyblok/react/rsc';
import { imageUrl, imageAlt } from '@/lib/images';

const Header = ({ blok }) => {
	const logo = imageUrl(blok.logo, 0, 64);
	return (
		<header {...storyblokEditable(blok)} className="site-header">
			<div className="wp-wrap site-header__inner">
				<Link className="site-header__logo" href="/">
					{logo ? (
						// eslint-disable-next-line @next/next/no-img-element
						<img src={logo} alt={imageAlt(blok.logo)} loading="lazy" />
					) : (
						<>
							way<span>point</span>
						</>
					)}
				</Link>
				<nav className="site-header__nav">
					{(blok.nav || []).map((b) => (
						<StoryblokServerComponent blok={b} key={b._uid} />
					))}
				</nav>
				<div className="site-header__cta">
					{(blok.cta || []).map((b) => (
						<StoryblokServerComponent blok={b} key={b._uid} size="sm" />
					))}
				</div>
			</div>
		</header>
	);
};

export default Header;
