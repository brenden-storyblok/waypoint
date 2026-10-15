import { storyblokEditable } from '@storyblok/react/rsc';
import { imageUrl, imageAlt } from '@/lib/images';
import { bentoLayout } from '@/lib/bento';
import ImageCredit from './ImageCredit';
import './DestinationGallery.css';

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
					{bentoLayout(images).map(({ asset, wide, narrow }) => (
						<div
							key={asset.id ?? asset.filename}
							className="destination-gallery__tile"
							style={{
								'--tile-cols': wide.cols,
								'--tile-rows': wide.rows,
								'--tile-cols-narrow': narrow.cols,
								'--tile-rows-narrow': narrow.rows,
							}}
						>
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img
								className="wp-img destination-gallery__img"
								src={imageUrl(asset, 900, 0)}
								alt={imageAlt(asset)}
								loading="lazy"
							/>
							<ImageCredit asset={asset} />
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

export default DestinationGallery;
