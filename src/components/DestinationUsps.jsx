import {
	storyblokEditable,
	StoryblokServerComponent,
} from '@storyblok/react/rsc';
import './DestinationUsps.css';

const DestinationUsps = ({ blok, destination }) => {
	if (!destination) return null;

	return (
		<section
			{...storyblokEditable(blok)}
			className="destination-usps wp-section"
		>
			<div className="wp-wrap">
				{blok.headline && (
					<div className="destination-usps__head">
						<h2 className="wp-section-title">{blok.headline}</h2>
					</div>
				)}
				<div className="destination-usps__list">
					{destination.usps?.map((nestedBlok) => (
						<StoryblokServerComponent
							blok={nestedBlok}
							key={nestedBlok._uid}
						/>
					))}
				</div>
			</div>
		</section>
	);
};

export default DestinationUsps;
