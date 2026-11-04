export function imageAlt(asset) {
	return asset?.alt || '';
}

export function imageCredit(asset) {
	return asset?.copyright?.trim() || '';
}
