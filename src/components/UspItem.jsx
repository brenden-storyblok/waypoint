import { storyblokEditable } from '@storyblok/react/rsc';

// DestinationUsps draws the dividers between items, since they depend on how
// many columns the list has at each width.
const UspItem = ({ blok }) => (
	<div
		{...storyblokEditable(blok)}
		className="grid content-start gap-2.5 pt-5.5 pr-5.5 pb-2"
	>
		<h3 className="font-display text-xl leading-[1.05] font-semibold tracking-[-0.01em] text-balance">
			{blok.title}
		</h3>
		{blok.text && (
			<p className="text-sm leading-relaxed text-slate-500 dark:text-slate-300">
				{blok.text}
			</p>
		)}
	</div>
);

export default UspItem;
