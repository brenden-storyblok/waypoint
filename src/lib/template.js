/**
 * Fills the `{name}` placeholders of a UI Label template with `values`.
 * A placeholder with no value stays as written. Pure, so server and browser
 * share it.
 */
export const fillTemplate = (template, values) =>
	template.replace(/\{(\w+)\}/g, (placeholder, name) =>
		name in values ? String(values[name]) : placeholder,
	);
