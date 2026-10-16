import {
	storyblokEditable,
	StoryblokServerRichText,
} from '@storyblok/react/rsc';
import { RICH_TEXT_CLASSES } from './richTextClasses';

const DestinationBio = ({ blok, destination }) => {
	if (!destination) return null;

	return (
		<section
			{...storyblokEditable(blok)}
			className="bg-white py-18 dark:bg-deep-sea-800"
		>
			<div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-gutter md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-12">
				<h2 className="font-display text-display leading-[1.05] font-extrabold tracking-[-0.01em] text-balance">
					{blok.headline}
				</h2>
				{destination.description && (
					<div className={RICH_TEXT_CLASSES}>
						<StoryblokServerRichText document={destination.description} />
					</div>
				)}
			</div>
		</section>
	);
};

export default DestinationBio;
