import Link from 'next/link';
import {
	storyblokEditable,
	StoryblokServerComponent,
} from '@storyblok/react/rsc';
import { DEFAULT_LANGUAGE } from '@/lib/language';
import LanguageSwitcher from './LanguageSwitcher';
import StoryblokImage from './StoryblokImage';

const LOGO_HEIGHT = 32;
const FALLBACK_RATIO = 4;

/** Width at the logo height, from the asset's "WxH" size, else 4:1. */
const logoWidth = (logo) => {
	const [width, height] = (logo.meta_data?.size || '').split('x').map(Number);
	const ratio = width > 0 && height > 0 ? width / height : FALLBACK_RATIO;
	return Math.round(LOGO_HEIGHT * ratio);
};

/** `language` is the current Language, passed down by the root layout. */
const Header = ({ blok, language = DEFAULT_LANGUAGE }) => {
	const hasLogo = Boolean(blok.logo?.filename);
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
					{hasLogo ? (
						<StoryblokImage
							asset={blok.logo}
							height={LOGO_HEIGHT}
							width={logoWidth(blok.logo)}
							className="block h-8 w-auto"
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
				<div className="ms-auto flex items-center gap-4 md:ms-0">
					<LanguageSwitcher language={language} />
					<div className="hidden sm:flex">
						{(blok.cta || []).map((ctaBlok) => (
							<StoryblokServerComponent
								blok={ctaBlok}
								key={ctaBlok._uid}
								size="sm"
							/>
						))}
					</div>
				</div>
			</div>
		</header>
	);
};

export default Header;
