import ImageCredit from './ImageCredit';
import { imageUrl, imageAlt } from '@/lib/images';

const capitalise = (text) =>
	text ? text.charAt(0).toUpperCase() + text.slice(1) : '';

/**
 * One Destination as a card. Links to its Destination Page when `href` is set;
 * only a linked card reacts to hover.
 */
const DestinationCard = ({ destination, href }) => {
	const content = destination.content || {};
	const name = content.name || destination.name;
	const src = imageUrl(content.hero_image, 800, 1000);

	const body = (
		<>
			<div className="relative aspect-4/5 overflow-hidden rounded-md bg-placeholder group-hover:scale-[1.015] motion-safe:transition-transform motion-safe:duration-300">
				{src && (
					// eslint-disable-next-line @next/next/no-img-element
					<img
						className="block size-full bg-placeholder object-cover"
						src={src}
						alt={imageAlt(content.hero_image)}
						loading="lazy"
					/>
				)}
				{src && <ImageCredit asset={content.hero_image} />}
			</div>
			<div className="flex items-baseline justify-between gap-3">
				<h3 className="font-display text-3xl leading-[1.05] font-semibold tracking-[-0.01em] text-balance">
					{name}
				</h3>
				{content.country && (
					<span className="font-mono text-xs tracking-widest text-slate-500 uppercase dark:text-slate-300">
						{capitalise(content.country)}
					</span>
				)}
			</div>
			{href && (
				<span className="font-display text-sm text-lagoon-700 group-hover:underline dark:text-lagoon-300">
					Explore {name} →
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
