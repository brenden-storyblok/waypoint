import Link from 'next/link';
import {
	storyblokEditable,
	StoryblokServerComponent,
} from '@storyblok/react/rsc';
import { imageUrl, imageAlt } from '@/lib/images';

const Header = ({ blok }) => {
	const logo = imageUrl(blok.logo, 0, 64);
	return (
		<header
			{...storyblokEditable(blok)}
			className="border-b border-mist-200 dark:border-deep-sea-700"
		>
			<div className="mx-auto flex max-w-7xl items-center gap-6 px-gutter py-4.5">
				<Link
					className="font-display text-xl font-extrabold tracking-tight no-underline"
					href="/"
				>
					{logo ? (
						// eslint-disable-next-line @next/next/no-img-element
						<img
							className="block h-8 w-auto"
							src={logo}
							alt={imageAlt(blok.logo)}
							loading="lazy"
						/>
					) : (
						<>
							way
							<span className="text-lagoon-700 dark:text-lagoon-300">
								point
							</span>
						</>
					)}
				</Link>
				<nav className="ms-auto hidden gap-5 font-display text-sm text-slate-500 md:flex dark:text-slate-300 [&>a:hover]:text-deep-sea-900 dark:[&>a:hover]:text-frost-200">
					{(blok.nav || []).map((navBlok) => (
						<StoryblokServerComponent blok={navBlok} key={navBlok._uid} />
					))}
				</nav>
				<div className="ms-auto hidden sm:flex md:ms-0">
					{(blok.cta || []).map((ctaBlok) => (
						<StoryblokServerComponent
							blok={ctaBlok}
							key={ctaBlok._uid}
							size="sm"
						/>
					))}
				</div>
			</div>
		</header>
	);
};

export default Header;
