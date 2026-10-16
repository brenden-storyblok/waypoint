import { storyblokEditable } from '@storyblok/react/rsc';
import { resolveLink } from '@/lib/links';

// The parent (Header nav, FooterColumn) sets the hover style for its links
const NavLink = ({ blok }) => (
	<a
		{...storyblokEditable(blok)}
		className="no-underline"
		href={resolveLink(blok.link)}
	>
		{blok.label}
	</a>
);

export default NavLink;
