import {
	storyblokEditable,
	StoryblokServerComponent,
} from '@storyblok/react/rsc';

const FooterColumn = ({ blok }) => (
	<div
		{...storyblokEditable(blok)}
		className="grid content-start gap-2 text-sm [&>a:hover]:underline"
	>
		{blok.headline && (
			<h3 className="mb-1 font-mono text-xs leading-none font-normal tracking-widest uppercase opacity-70">
				{blok.headline}
			</h3>
		)}
		{(blok.links || []).map((nestedBlok) => (
			<StoryblokServerComponent blok={nestedBlok} key={nestedBlok._uid} />
		))}
	</div>
);

export default FooterColumn;
