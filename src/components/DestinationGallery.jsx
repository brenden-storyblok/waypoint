import { storyblokEditable } from '@storyblok/react/rsc';
import { imageUrl, imageAlt } from '@/lib/images';
import './DestinationGallery.css';

const tileClass = (index) => {
	const slot = index % 5;
	if (slot === 0 || slot === 4) return ' destination-gallery__tile--wide';
	if (slot === 1) return ' destination-gallery__tile--tall';
	return '';
};

const DestinationGallery = ({ blok, destination }) => {
	if (!destination) return null;

	const images = (destination.gallery ?? []).filter((asset) => asset?.filename);

	return (
		<section
			{...storyblokEditable(blok)}
			className="destination-gallery wp-section"
		>
			<div className="wp-wrap">
				<div className="destination-gallery__head">
					{blok.headline && (
						<h2 className="wp-section-title">{blok.headline}</h2>
					)}
					{images.length > 0 && (
						<span className="destination-gallery__count">
							{images.length} {images.length === 1 ? 'image' : 'images'}
						</span>
					)}
				</div>
				<div className="destination-gallery__grid">
					{images.map((asset, index) => (
						<div
							key={asset.id ?? asset.filename}
							className={`destination-gallery__tile${tileClass(index)}`}
						>
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img
								className="wp-img destination-gallery__img"
								src={imageUrl(asset, 900, 0)}
								alt={imageAlt(asset)}
								loading="lazy"
							/>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

export default DestinationGallery;
