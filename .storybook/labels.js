/**
 * Stand-in for src/lib/labels.js in Storybook, which has no Storyblok
 * connection. Serves the few UI Labels the stories show.
 */
const LABELS = {
	en: {
		'switcher-label': 'Language',
		'image-one': '{count} image',
		'image-other': '{count} images',
	},
	de: { 'switcher-label': 'Sprache' },
	es: { 'switcher-label': 'Idioma' },
	fr: { 'switcher-label': 'Langue' },
};

export const loadLabels = async () => ({});

export const getLabel = async (key, language) => LABELS[language]?.[key] ?? key;
