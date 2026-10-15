/**
 * Destination search: owns the Pool and filtering rules for a destination
 * grid. Pure: no Storyblok or React imports, so the server render and the
 * browser can share it.
 *
 * Input:
 *   destinations  [{ uuid, name, country, attributes }] the loaded Destinations
 *   settings      the grid's editor settings:
 *                   picked      [uuid] picked Destinations, in editor order;
 *                               empty means every Destination
 *                   countries   [value] a Destination stays in the Pool when
 *                               its Country is any of them
 *                   attributes  [value] a Destination stays in the Pool when
 *                               it carries any of these Destination Attributes
 *                 A Destination must pass both countries and attributes.
 *   choices       the visitor's choices: { text, attributes } (see parseChoices)
 *   labels        display labels by stored value, in datasource order:
 *                 { countries: { spain: 'Spain' }, attributes: { beach: 'Beach' } }
 *
 * Output:
 *   pool          Destinations the editor makes available in the grid
 *   visible       Destinations in the Pool that pass the visitor's choices
 *   counts        { visible, pool }
 *   narrowed      true while the visitor's choices narrow the Pool
 *   options       { attributes: [{ value, label }] } Destination Attribute chips:
 *                 values some Destination in the Pool carries
 *
 * Search Text matches a Destination's name or Country label as a substring,
 * ignoring case and accents. A Country with no label matches on its value.
 * A Destination passes the Destination Attribute Filters when it carries any
 * selected one, and must also pass the Search Text.
 *
 * Returned Destinations are the same objects passed in.
 */
export function searchDestinations({
	destinations = [],
	settings = {},
	choices = {},
	labels = {},
}) {
	const pool = pickedOrAll(destinations, settings.picked || [])
		.filter(inAnyCountry(settings.countries || []))
		.filter(carriesAny(settings.attributes || []));
	const countryLabel = (value) => labels.countries?.[value] ?? value;
	const text = fold(choices.text || '');
	const attributes = choices.attributes || [];
	const visible = pool
		.filter(
			(d) =>
				!text ||
				[d.name, countryLabel(d.country)].some((s) => fold(s).includes(text)),
		)
		.filter(carriesAny(attributes));
	return {
		pool,
		visible,
		counts: { visible: visible.length, pool: pool.length },
		narrowed: Boolean(text) || attributes.length > 0,
		options: { attributes: attributeOptions(pool, labels.attributes || {}) },
	};
}

// Destination Attribute chips: [{ value, label }] for each value some
// Destination in the Pool carries. Labelled values come first in label
// (datasource) order; a value with no label follows, labelled by its value.
function attributeOptions(pool, labels) {
	const present = new Set(pool.flatMap((d) => d.attributes || []));
	const labelled = Object.keys(labels).filter((v) => present.has(v));
	const unlabelled = [...present].filter((v) => !(v in labels));
	return [...labelled, ...unlabelled].map((value) => ({
		value,
		label: labels[value] ?? value,
	}));
}

/**
 * The count line for a searchDestinations result: "X of Y places" while the
 * visitor's choices narrow the Pool, "Y places" otherwise.
 */
export function placesLabel({ counts, narrowed }) {
	const places = (n) => `${n} ${n === 1 ? 'place' : 'places'}`;
	return narrowed
		? `${counts.visible} of ${places(counts.pool)}`
		: places(counts.pool);
}

/*
 * URL choices. One searchable grid per page, so every grid reads the same
 * params:
 *   q          Search Text
 *   attribute  a selected Destination Attribute Filter, once per value
 * Each choice param is listed in CHOICE_PARAMS so serialising replaces it and
 * keeps every other param (Visual Editor `_storyblok*`).
 */
const CHOICE_PARAMS = ['q', 'attribute'];

/**
 * The visitor's choices from URL search params. Accepts URLSearchParams (the
 * browser) or a page `searchParams` object whose values are a string or an
 * array of strings (the server).
 *
 * Returns { text, attributes }.
 */
export function parseChoices(params) {
	const all = paramReader(params);
	return { text: all('q')[0] || '', attributes: all('attribute') };
}

/**
 * The query string (no leading "?") for `choices`, keeping every param in
 * `current` that is not a choice param. `current` takes the same shapes as
 * parseChoices, or a query string.
 */
export function serialiseChoices(choices, current = '') {
	const out = new URLSearchParams(
		toEntries(current).filter(([key]) => !CHOICE_PARAMS.includes(key)),
	);
	if (choices.text?.trim()) out.append('q', choices.text);
	for (const value of choices.attributes || []) out.append('attribute', value);
	return out.toString();
}

// `all(key)` returns every value for `key` in `params`, as an array.
function paramReader(params) {
	const entries = toEntries(params);
	return (key) => entries.filter(([k]) => k === key).map(([, v]) => v);
}

// [key, value] pairs from URLSearchParams, a query string or a page
// `searchParams` object.
function toEntries(params) {
	if (!params) return [];
	if (typeof params === 'string') return [...new URLSearchParams(params)];
	// URLSearchParams, or Next's ReadonlyURLSearchParams from useSearchParams.
	if (typeof params.getAll === 'function') return [...params.entries()];
	return Object.entries(params).flatMap(([key, value]) =>
		[value].flat().filter((v) => v != null).map((v) => [key, String(v)]),
	);
}

// Lower case, accents removed and spaces trimmed, so "SEVÍLLE " reads as
// "seville".
const fold = (s) =>
	String(s ?? '')
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.toLowerCase()
		.trim();

// Picked Destinations in the editor order, or every Destination when none
// are picked. A picked uuid with no loaded Destination is dropped.
function pickedOrAll(destinations, picked) {
	if (!picked.length) return destinations;
	const byUuid = new Map(destinations.map((d) => [d.uuid, d]));
	return picked.map((uuid) => byUuid.get(uuid)).filter(Boolean);
}

// Keeps a Destination whose Country is any of the chosen Countries. No
// chosen Countries keeps every Destination.
function inAnyCountry(countries) {
	if (!countries.length) return () => true;
	const chosen = new Set(countries);
	return (d) => chosen.has(d.country);
}

// Keeps a Destination that carries any of the chosen Destination Attributes.
// No chosen Destination Attribute keeps every Destination.
function carriesAny(chosen) {
	if (!chosen.length) return () => true;
	return (d) => (d.attributes || []).some((a) => chosen.includes(a));
}
