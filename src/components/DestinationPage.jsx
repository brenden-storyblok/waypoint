import {
	storyblokEditable,
	StoryblokServerComponent,
} from '@storyblok/react/rsc';

const DestinationPage = ({ blok }) => {
	const destination =
		blok.destination && typeof blok.destination === 'object'
			? blok.destination
			: null;
	const destinationContent = destination?.content ?? null;

	return (
		<main {...storyblokEditable(blok)}>
			{blok.body?.map((nestedBlok) => (
				<StoryblokServerComponent
					blok={nestedBlok}
					key={nestedBlok._uid}
					destination={destinationContent}
				/>
			))}
		</main>
	);
};

export default DestinationPage;
