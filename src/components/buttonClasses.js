// Button's class maps, kept free of @storyblok/react so client components
// (e.g. DestinationSearchView's Clear all) can look like a Button.

export const BASE_CLASSES =
	'inline-block rounded-full border-2 font-display font-semibold leading-tight no-underline hover:-translate-y-px hover:brightness-105 motion-safe:transition-[transform,filter] motion-safe:duration-150';

export const VARIANT_CLASSES = {
	primary:
		'border-transparent bg-sun-400 text-deep-sea-900 dark:bg-sun-300 dark:text-deep-sea-950',
	secondary: 'border-current',
	tertiary: 'border-transparent',
};

export const SIZE_CLASSES = {
	regular: 'px-5 py-3 text-lg',
	sm: 'px-4 py-2 text-sm',
};

/** The class string for a Button: variant is 'primary', 'secondary' or 'tertiary', size 'regular' or 'sm'. */
export const buttonClasses = (variant, size) =>
	[BASE_CLASSES, VARIANT_CLASSES[variant], SIZE_CLASSES[size]].join(' ');
