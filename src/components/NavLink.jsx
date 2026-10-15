import { storyblokEditable } from '@storyblok/react/rsc';
import './NavLink.css';
import { resolveLink } from '@/lib/links';

const NavLink = ({ blok }) => (
	<a
		{...storyblokEditable(blok)}
		className="nav-link"
		href={resolveLink(blok.link)}
	>
		{blok.label}
	</a>
);

export default NavLink;
