import { storyblokEditable } from '@storyblok/react/rsc';
import { getCurrentLanguage } from '@/lib/currentLanguage';
import { linkHref } from '@/lib/language';
import { VARIANT_CLASSES, buttonClasses } from './buttonClasses';

const Button = async ({ blok, size }) => {
	const variant = VARIANT_CLASSES[blok.variant] ? blok.variant : 'primary';
	const language = await getCurrentLanguage();

	return (
		<a
			{...storyblokEditable(blok)}
			className={buttonClasses(variant, size === 'sm' ? 'sm' : 'regular')}
			href={linkHref(blok.link, language)}
		>
			{blok.label}
		</a>
	);
};

export default Button;
