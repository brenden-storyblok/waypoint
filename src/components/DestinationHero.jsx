import { storyblokEditable } from '@storyblok/react/rsc';
import { lang } from 'next/root-params';
import { countryName } from '@/lib/countryName';
import { fetchBlurDataUrl } from '@/lib/fetchBlurDataUrl';
import { loadLabels } from '@/lib/labels';
import ImageCredit from './ImageCredit';
import StoryblokImage from './StoryblokImage';

// A hero is the largest image on its page, so it uses 85 over the default 75.
const HERO_QUALITY = 85;

const DestinationHero = async ({ blok, destination }) => {
	if (!destination) return null;

	const language = await lang();
	const countries = await loadLabels('countries', language);
	const blurDataURL = await fetchBlurDataUrl(destination.hero_image);
	const hasImage = Boolean(destination.hero_image?.filename);
	const place = [
		destination.region,
		countryName(countries, destination.country),
	]
		.filter(Boolean)
		.join(' · ');

	return (
		<section
			{...storyblokEditable(blok)}
			className="relative flex min-h-120 items-end overflow-hidden bg-placeholder text-white sm:min-h-140"
		>
			<div className="absolute inset-0">
				<StoryblokImage
					asset={destination.hero_image}
					blurDataURL={blurDataURL}
					fill
					sizes="100vw"
					loading="eager"
					fetchPriority="high"
					quality={HERO_QUALITY}
					className="bg-placeholder object-cover"
				/>
			</div>
			<div className="absolute inset-0 bg-linear-to-b from-shade-0 from-30% to-shade-70" />
			<div className="relative mx-auto grid w-full max-w-7xl gap-3.5 px-gutter py-14">
				{place && (
					<div className="flex items-center gap-2.5 font-mono text-xs tracking-widest uppercase before:h-0.5 before:w-7 before:bg-sun-400 before:content-[''] dark:before:bg-sun-300">
						{place}
					</div>
				)}
				<h1 className="font-display text-destination-name leading-[0.85] font-extrabold tracking-[-0.04em] text-balance">
					{destination.name}
				</h1>
				{destination.summary && (
					<p className="max-w-[38ch] text-xl">{destination.summary}</p>
				)}
			</div>
			{hasImage && <ImageCredit asset={destination.hero_image} />}
		</section>
	);
};

export default DestinationHero;
