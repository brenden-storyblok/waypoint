import {
	storyblokEditable,
	StoryblokServerComponent,
} from '@storyblok/react/rsc';

const Page = ({ blok, searchParams }) => (
	<main {...storyblokEditable(blok)}>
		{blok.body?.map((nestedBlok) => (
			<StoryblokServerComponent
				blok={nestedBlok}
				key={nestedBlok._uid}
				searchParams={searchParams}
			/>
		))}
	</main>
);

export default Page;
