'use client';

import { getStoryblokApi } from '@/lib/storyblokClient';

export default function StoryblokProvider({ children }) {
	getStoryblokApi();
	return children;
}
