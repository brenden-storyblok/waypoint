import { storyblokEditable } from '@storyblok/react/rsc';
import { imageUrl, imageAlt } from '@/lib/images';
import ImageCredit from './ImageCredit';
import './DestinationHero.css';

const capitalise = (value) =>
	value ? value.charAt(0).toUpperCase() + value.slice(1) : '';

const DestinationHero = ({ blok, destination }) => {
	if (!destination) return null;

	const src = imageUrl(destination.hero_image, 2000, 0);
	const place = [destination.region, capitalise(destination.country)]
		.filter(Boolean)
		.join(' · ');

	return (
		<section {...storyblokEditable(blok)} className="destination-hero">
			<div className="destination-hero__media">
				{src && (
					// eslint-disable-next-line @next/next/no-img-element
					<img
						className="wp-img"
						src={src}
						alt={imageAlt(destination.hero_image)}
					/>
				)}
			</div>
			<div className="destination-hero__shade" />
			<div className="destination-hero__copy wp-wrap">
				{place && <div className="destination-hero__place">{place}</div>}
				<h1 className="destination-hero__name">{destination.name}</h1>
				{destination.summary && (
					<p className="destination-hero__summary">{destination.summary}</p>
				)}
			</div>
			{src && <ImageCredit asset={destination.hero_image} />}
		</section>
	);
};

export default DestinationHero;
