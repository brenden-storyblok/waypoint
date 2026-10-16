import {
	storyblokEditable,
	StoryblokServerComponent,
} from '@storyblok/react/rsc';
import { imageUrl, imageAlt } from '@/lib/images';
import ImageCredit from './ImageCredit';

const Hero = ({ blok }) => {
	const src = imageUrl(blok.image, 1200, 0);

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
				{src && (
					// eslint-disable-next-line @next/next/no-img-element
					<img
						className="block size-full bg-placeholder object-cover"
						src={src}
						alt={imageAlt(blok.image)}
					/>
				)}
				{src && <ImageCredit asset={blok.image} />}
			</div>
		</section>
	);
};

export default Hero;
