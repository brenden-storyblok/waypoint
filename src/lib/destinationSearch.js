/**
 * Destination search: owns the Pool and filtering rules for a destination
 * grid. Pure: no Storyblok or React imports, so the server render and the
 * browser can share it.
 *
 * Input:
 *   destinations  [{ uuid, name, country, attributes }] the loaded set the
 *                 Pool is filtered from, in display order (the picked
 *                 Destinations in editor order, or every Destination)
 *   settings      the grid's editor settings, applied to every loaded set,
 *                 even one the Delivery API already filtered:
 *                   countries   [value] a Destination stays in the Pool when
 *                               its Country is any of them
 *                   attributes  [value] a Destination stays in the Pool when
 *                               it carries any of these Destination Attributes
 *                 A Destination must pass both countries and attributes; an
 *                 empty setting keeps every Destination.
 *   choices       the visitor's choices: { text, countries, attributes } (see
 *                 parseChoices). A Destination must pass all three: its Country
 *                 is any selected Country, it carries any selected Destination
 *                 Attribute (an empty group passes every one), and it matches
 *                 the Search Text.
 *   labels        display labels by stored value, in datasource order:
 *                 { countries: { spain: 'Spain' }, attributes: { beach: 'Beach' } }
 *
 * Output:
 *   pool          Destinations the editor makes available in the grid
 *   visible       Destinations in the Pool that pass the visitor's choices
 *   counts        { visible, pool }
 *   narrowed      true while the visitor's choices narrow the Pool
 *   chips         Filter chips, built from the Pool so they never change
 *                 with the visitor's choices:
 *                   countries  [{ value, label }] each Country some Destination
 *                              in the Pool carries, in datasource order
 *                   attributes [{ value, label }] each Destination Attribute
 *                              some Destination in the Pool carries, in
 *                              datasource order
 *                 A selected value with no chip is ignored.
 *
 * Search Text matches a Destination's name or Country label as a substring,
 * ignoring case and accents. A Country with no label matches on its value.
 *
 * Returned Destinations are the same objects passed in.
 */
export function searchDestinations({
	destinations = [],
	settings = {},
	choices = {},
	labels = {},
}) {
	const pool = destinations
		.filter(inAnyCountry(settings.countries || []))
		.filter(carriesAny(settings.attributes || []));
	const countryLabel = (value) => labels.countries?.[value] ?? value;
	const chips = {
		countries: chipsFor(
			pool.map((destination) => destination.country),
			labels.countries,
		),
		attributes: chipsFor(
			pool.flatMap((destination) => destination.attributes || []),
			labels.attributes,
		),
	};
	// A selected value with no chip cannot be seen or cleared, so it is ignored.
	const countries = withChip(choices.countries, chips.countries);
	const attributes = withChip(choices.attributes, chips.attributes);
	const text = fold(choices.text || '');
	const visible = pool
		.filter(inAnyCountry(countries))
		.filter(carriesAny(attributes))
		.filter(
			(destination) =>
				!text ||
				[destination.name, countryLabel(destination.country)].some(
					(searchable) => fold(searchable).includes(text),
				),
		);
	return {
		pool,
		visible,
		counts: { visible: visible.length, pool: pool.length },
		narrowed: Boolean(text) || countries.length > 0 || attributes.length > 0,
		chips,
	};
}

/**
 * The count line for a searchDestinations result: "X of Y places" while the
 * visitor's choices narrow the Pool, "Y places" otherwise.
 */
export function placesLabel({ counts, narrowed }) {
	const places = (count) => `${count} ${count === 1 ? 'place' : 'places'}`;
	return narrowed
		? `${counts.visible} of ${places(counts.pool)}`
		: places(counts.pool);
}

/*
 * URL choices. One searchable grid per page, so every grid reads the same
 * params:
 *   q          Search Text
 *   country    a Country Filter, once per selected Country
 *   attribute  a Destination Attribute Filter, once per selected value
 * Each choice param is listed in CHOICE_PARAMS so serialising replaces it and
 * keeps every other param (Visual Editor `_storyblok*`).
 */
const CHOICE_PARAMS = ['q', 'country', 'attribute'];

/**
 * The visitor's choices from URL search params. Accepts URLSearchParams (the
 * browser) or a page `searchParams` object whose values are a string or an
 * array of strings (the server).
 *
 * Returns { text, countries, attributes }: countries and attributes hold every
 * `country` and `attribute` value, in URL order.
 */
export function parseChoices(params) {
	const valuesOf = paramReader(params);
	return {
		text: valuesOf('q')[0] || '',
		countries: valuesOf('country'),
		attributes: valuesOf('attribute'),
	};
}

/**
 * The query string (no leading "?") for `choices`, keeping every param in
 * `current` that is not a choice param. `current` is a query string, with or
 * without its leading "?" (e.g. window.location.search).
 */
export function serialiseChoices(choices, current = '') {
	const out = new URLSearchParams(
		withoutChoices([...new URLSearchParams(current)]),
	);
	if (choices.text?.trim()) out.append('q', choices.text);
	for (const country of choices.countries || []) out.append('country', country);
	for (const value of choices.attributes || []) out.append('attribute', value);
	return out.toString();
}

/**
 * The Clear all link for a page `searchParams` object: "?" and every param
 * that is not a choice param, so it reloads the current page with no choices
 * and keeps the Visual Editor `_storyblok*` params.
 */
export function clearChoicesHref(params) {
	return `?${new URLSearchParams(withoutChoices(toEntries(params)))}`;
}

// The [key, value] pairs whose key is not a choice param.
const withoutChoices = (entries) =>
	entries.filter(([key]) => !CHOICE_PARAMS.includes(key));

// `valuesOf(key)` returns every value for `key` in `params`, as an array.
function paramReader(params) {
	const entries = toEntries(params);
	return (key) =>
		entries.filter(([entryKey]) => entryKey === key).map(([, value]) => value);
}

// [key, value] pairs from URLSearchParams or a page `searchParams` object.
function toEntries(params) {
	if (!params) return [];
	// URLSearchParams, or Next's ReadonlyURLSearchParams from useSearchParams.
	if (typeof params.getAll === 'function') return [...params.entries()];
	return Object.entries(params).flatMap(([key, value]) =>
		[value]
			.flat()
			.filter((item) => item != null)
			.map((item) => [key, String(item)]),
	);
}

// Lower case, accents removed and spaces trimmed, so "SEVÍLLE " reads as
// "seville".
const fold = (text) =>
	String(text ?? '')
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.toLowerCase()
		.trim();

// Chips for the distinct `values` the Pool carries: [{ value, label }].
// Labelled values come first in the order of `labels` (the datasource
// order), then values with no label, labelled by their value, in Pool order.
function chipsFor(values, labels = {}) {
	const present = new Set(values.filter(Boolean));
	const labelled = Object.keys(labels).filter((value) => present.has(value));
	const unlabelled = [...present].filter(
		(value) => !Object.hasOwn(labels, value),
	);
	return [...labelled, ...unlabelled].map((value) => ({
		value,
		label: labels[value] ?? value,
	}));
}

// The `selected` values that have a chip.
function withChip(selected = [], chips) {
	const values = new Set(chips.map((chip) => chip.value));
	return selected.filter((value) => values.has(value));
}

// Keeps a Destination whose Country is any of the chosen Countries. No
// chosen Countries keeps every Destination.
function inAnyCountry(countries) {
	if (!countries.length) return () => true;
	const chosen = new Set(countries);
	return (destination) => chosen.has(destination.country);
}

// Keeps a Destination that carries any of the chosen Destination Attributes.
// No chosen Destination Attribute keeps every Destination.
function carriesAny(chosen) {
	if (!chosen.length) return () => true;
	return (destination) =>
		(destination.attributes || []).some((attribute) =>
			chosen.includes(attribute),
		);
}
