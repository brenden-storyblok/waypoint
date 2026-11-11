import { fillTemplate } from '@/lib/template';
import ImageCredit from './ImageCredit';
import StoryblokImage from './StoryblokImage';

// Column widths: 1 column under 640px, 2 up to 768px, 3 beyond (a card tops out
// near 380px in the grid). The Carousel cards are never wider than the grid.
const CARD_SIZES =
	'(min-width: 1280px) 380px, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw';

/**
 * One Destination as a card. Links to its Destination Page when `href` is set;
 * only a linked card reacts to hover. Presentational: `countryLabel` is the
 * Country's label and `exploreTemplate` the link text with a `{name}`
 * placeholder, both UI copy in the visitor's Language from the server.
 */
const DestinationCard = ({
	destination,
	href,
	countryLabel,
	exploreTemplate,
}) => {
	const content = destination.content || {};
	const name = content.name || destination.name;
	const hasImage = Boolean(content.hero_image?.filename);

	const body = (
		<>
			<div className="relative aspect-4/5 overflow-hidden rounded-md bg-placeholder group-hover:scale-[1.015] motion-safe:transition-transform motion-safe:duration-300">
				<StoryblokImage
					asset={content.hero_image}
					crop="4:5"
					fill
					sizes={CARD_SIZES}
					className="bg-placeholder object-cover"
				/>
				{hasImage && <ImageCredit asset={content.hero_image} />}
			</div>
			<div className="flex items-baseline justify-between gap-3">
				<h3 className="font-display text-3xl leading-[1.05] font-semibold tracking-[-0.01em] text-balance">
					{name}
				</h3>
				{countryLabel && (
					<span className="font-mono text-xs tracking-widest text-slate-500 uppercase dark:text-slate-300">
						{countryLabel}
					</span>
				)}
			</div>
			{href && exploreTemplate && (
				<span className="font-display text-sm text-lagoon-700 group-hover:underline dark:text-lagoon-300">
					{fillTemplate(exploreTemplate, { name })} →
				</span>
			)}
		</>
	);

	const cardClasses = 'grid content-start gap-3 no-underline';
	return href ? (
		<a className={`group ${cardClasses}`} href={href}>
			{body}
		</a>
	) : (
		<div className={cardClasses}>{body}</div>
	);
};

export default DestinationCard;
