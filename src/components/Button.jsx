import { storyblokEditable } from '@storyblok/react/rsc';
import { resolveLink } from '@/lib/links';
import './Button.css';

const Button = ({ blok, size }) => {
	const variant = blok.variant === 'secondary' ? 'secondary' : 'primary';
	const classes = ['btn', `btn--${variant}`, size === 'sm' ? 'btn--sm' : '']
		.filter(Boolean)
		.join(' ');

	return (
		<a
			{...storyblokEditable(blok)}
			className={classes}
			href={resolveLink(blok.link)}
		>
			{blok.label}
		</a>
	);
};

export default Button;
