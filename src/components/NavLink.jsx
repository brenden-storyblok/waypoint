import { storyblokEditable } from '@storyblok/react/rsc';
import { getCurrentLanguage } from '@/lib/currentLanguage';
import { linkHref } from '@/lib/language';

// The parent (Header nav, FooterColumn) sets the hover style for its links
const NavLink = async ({ blok }) => (
	<a
		{...storyblokEditable(blok)}
		className="no-underline"
		href={linkHref(blok.link, await getCurrentLanguage())}
	>
		{blok.label}
	</a>
);

export default NavLink;
