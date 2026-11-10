import { storyblokInit } from '@storyblok/react/rsc';
import { storyblokConfig } from '@/lib/storyblokConfig';

/**
 * The browser's SDK init, for the Visual Editor bridge. It registers no
 * components: Server Components render them, and importing them here would
 * pull server-only code (next/root-params) into the client bundle.
 */
export const getStoryblokApi = storyblokInit(storyblokConfig);
