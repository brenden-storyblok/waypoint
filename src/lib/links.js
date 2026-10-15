/**
 * Turns a Storyblok multilink field value into an href.
 * Internal story links use cached_url; the "home" story maps to "/".
 */
export function resolveLink(link) {
	if (!link) return '#';

	const anchor = link.anchor ? `#${link.anchor}` : '';

	switch (link.linktype) {
		case 'story': {
			const slug = link.cached_url || link.story?.full_slug || '';
			if (!slug || slug === 'home') return `/${anchor}`;
			return `/${slug.replace(/^\/+/, '')}${anchor}`;
		}
		case 'email':
			return `mailto:${link.email || link.url}`;
		case 'asset':
		case 'url':
		default:
			return `${link.url || link.cached_url || '#'}${anchor}`;
	}
}

/** Href for a resolved story object (e.g. a page found by a lookup query). */
export function storyHref(story) {
	if (!story?.full_slug || story.full_slug === 'home') return '/';
	return `/${story.full_slug}`;
}
