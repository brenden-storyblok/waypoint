import {
	storyblokEditable,
	StoryblokServerComponent,
} from '@storyblok/react/rsc';
import { imageUrl, imageAlt } from '@/lib/images';
import './Hero.css';

const Hero = ({ blok }) => {
	const src = imageUrl(blok.image, 1200, 0);

	return (
		<section {...storyblokEditable(blok)} className="hero">
			<div className="hero__copy">
				<h1 className="hero__headline">{blok.headline}</h1>
				{blok.intro && <p className="hero__intro">{blok.intro}</p>}
				{blok.cta?.length > 0 && (
					<div className="hero__ctas">
						{blok.cta.map((nestedBlok) => (
							<StoryblokServerComponent
								blok={nestedBlok}
								key={nestedBlok._uid}
							/>
						))}
					</div>
				)}
			</div>
			<div className="hero__media">
				{src && (
					// eslint-disable-next-line @next/next/no-img-element
					<img className="wp-img" src={src} alt={imageAlt(blok.image)} />
				)}
			</div>
		</section>
	);
};

export default Hero;
