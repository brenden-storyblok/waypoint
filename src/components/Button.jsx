import { storyblokEditable } from '@storyblok/react/rsc';
import { resolveLink } from '@/lib/links';
import { VARIANT_CLASSES, buttonClasses } from './buttonClasses';

const Button = ({ blok, size }) => {
	const variant = VARIANT_CLASSES[blok.variant] ? blok.variant : 'primary';

	return (
		<a
			{...storyblokEditable(blok)}
			className={buttonClasses(variant, size === 'sm' ? 'sm' : 'regular')}
			href={resolveLink(blok.link)}
		>
			{blok.label}
		</a>
	);
};

export default Button;
