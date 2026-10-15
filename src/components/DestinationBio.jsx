import {
	storyblokEditable,
	StoryblokServerRichText,
} from '@storyblok/react/rsc';
import './DestinationBio.css';

const DestinationBio = ({ blok, destination }) => {
	if (!destination) return null;

	return (
		<section
			{...storyblokEditable(blok)}
			className="destination-bio wp-section"
		>
			<div className="wp-wrap wp-split">
				<h2 className="wp-section-title">{blok.headline}</h2>
				{destination.description && (
					<div className="destination-bio__rich wp-rich">
						<StoryblokServerRichText document={destination.description} />
					</div>
				)}
			</div>
		</section>
	);
};

export default DestinationBio;
