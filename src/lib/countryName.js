/**
 * The visitor-facing name of a stored Country key: its label from the
 * `countries` datasource, else the key with a capital first letter as the last
 * resort. Pure, so server code can call it where it holds the loaded labels.
 */
export const countryName = (labels, key) => {
	if (!key) return '';
	if (Object.hasOwn(labels, key)) return labels[key];
	return key.charAt(0).toUpperCase() + key.slice(1);
};
