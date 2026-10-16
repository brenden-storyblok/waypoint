import {
	storyblokEditable,
	StoryblokServerComponent,
} from '@storyblok/react/rsc';

// Dividers between USP items follow the column count: a top rule when they
// stack, a left rule on the second column from sm, and on every column but
// the first from md.
const ITEM_DIVIDERS = [
	'*:border-mist-200 dark:*:border-deep-sea-700',
	'[&>*+*]:border-t',
	'sm:[&>*+*]:border-t-0 sm:[&>*:nth-child(even)]:border-l sm:[&>*:nth-child(even)]:pl-5.5',
	'md:[&>*+*]:border-l md:[&>*+*]:pl-5.5',
].join(' ');

const DestinationUsps = ({ blok, destination }) => {
	if (!destination) return null;

	return (
		<section {...storyblokEditable(blok)} className="py-18">
			<div className="mx-auto max-w-7xl px-gutter">
				{blok.headline && (
					<div className="mb-10 flex flex-wrap items-end justify-between gap-6">
						<h2 className="font-display text-display leading-[1.05] font-extrabold tracking-[-0.01em] text-balance">
							{blok.headline}
						</h2>
					</div>
				)}
				<div
					className={`grid grid-cols-1 gap-0 border-t-2 border-deep-sea-900 sm:grid-cols-2 md:grid-cols-4 dark:border-frost-200 ${ITEM_DIVIDERS}`}
				>
					{destination.usps?.map((nestedBlok) => (
						<StoryblokServerComponent blok={nestedBlok} key={nestedBlok._uid} />
					))}
				</div>
			</div>
		</section>
	);
};

export default DestinationUsps;
