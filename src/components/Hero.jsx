import {
	storyblokEditable,
	StoryblokServerComponent,
} from '@storyblok/react/rsc';
import { blurDataUrl } from '@/lib/blurDataUrl';
import ImageCredit from './ImageCredit';
import StoryblokImage from './StoryblokImage';

// The image column is half the section from md (1.05fr of 2.05fr, about 49vw);
// below md the image stacks full width.
const IMAGE_SIZES = '(min-width: 768px) 49vw, 100vw';

const Hero = async ({ blok }) => {
	const hasImage = Boolean(blok.image?.filename);
	const blurDataURL = await blurDataUrl(blok.image);

	return (
		<section
			{...storyblokEditable(blok)}
			className="grid grid-cols-1 items-stretch bg-white md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] dark:bg-deep-sea-800"
		>
			<div className="flex flex-col items-start justify-center gap-5 px-gutter py-hero">
				<h1 className="font-display text-hero leading-[1.05] font-extrabold tracking-[-0.01em] text-balance">
					{blok.headline}
				</h1>
				{blok.intro && (
					<p className="max-w-[32ch] text-xl text-slate-500 dark:text-slate-300">
						{blok.intro}
					</p>
				)}
				{blok.cta?.length > 0 && (
					<div className="flex flex-wrap gap-3">
						{blok.cta.map((nestedBlok) => (
							<StoryblokServerComponent
								blok={nestedBlok}
								key={nestedBlok._uid}
							/>
						))}
					</div>
				)}
			</div>
			<div className="relative min-h-65 bg-placeholder md:min-h-95">
				<StoryblokImage
					asset={blok.image}
					blurDataURL={blurDataURL}
					fill
					sizes={IMAGE_SIZES}
					loading="eager"
					fetchPriority="high"
					className="bg-placeholder object-cover"
				/>
				{hasImage && <ImageCredit asset={blok.image} />}
			</div>
		</section>
	);
};

export default Hero;
