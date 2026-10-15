import ImageCredit from './ImageCredit';
import { imageUrl, imageAlt } from '@/lib/images';

const capitalise = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');

/**
 * One Destination as a card. Links to its Destination Page when `href` is set.
 * Uses the destination-grid__* classes from DestinationGrid.css.
 */
const DestinationCard = ({ destination, href }) => {
	const content = destination.content || {};
	const name = content.name || destination.name;
	const src = imageUrl(content.hero_image, 800, 1000);

	const body = (
		<>
			<div className="destination-grid__media">
				{src && (
					// eslint-disable-next-line @next/next/no-img-element
					<img
						className="wp-img"
						src={src}
						alt={imageAlt(content.hero_image)}
						loading="lazy"
					/>
				)}
				{src && <ImageCredit asset={content.hero_image} />}
			</div>
			<div className="destination-grid__meta">
				<h3 className="destination-grid__name">{name}</h3>
				{content.country && (
					<span className="destination-grid__country">
						{capitalise(content.country)}
					</span>
				)}
			</div>
			{href && <span className="destination-grid__go">Explore {name} →</span>}
		</>
	);

	return href ? (
		<a className="destination-grid__card" href={href}>
			{body}
		</a>
	) : (
		<div className="destination-grid__card">{body}</div>
	);
};

export default DestinationCard;
