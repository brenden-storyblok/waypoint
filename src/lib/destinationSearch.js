/**
 * Destination search: owns the Pool and filtering rules for a destination
 * grid. Pure: no Storyblok or React imports, so the server render and the
 * browser can share it.
 *
 * Input:
 *   destinations  [{ uuid, name, country, attributes }] the loaded Destinations
 *   settings      the grid's editor settings:
 *                   picked      [uuid] picked Destinations, in editor order
 *                   attributes  [value] Destination Attributes; a Destination
 *                               stays in the Pool when it carries any of them
 *
 * Output:
 *   pool          Destinations the editor makes available in the grid
 *   visible       Destinations shown to the visitor
 *   counts        { visible, pool }
 *
 * Returned Destinations are the same objects passed in.
 */
export function searchDestinations({ destinations = [], settings = {} }) {
	const pool = pickedOrAll(destinations, settings.picked || []).filter(
		carriesAny(settings.attributes || []),
	);
	const visible = pool;
	return {
		pool,
		visible,
		counts: { visible: visible.length, pool: pool.length },
	};
}

// Picked Destinations in the editor order, or every Destination when none
// are picked. A picked uuid with no loaded Destination is dropped.
function pickedOrAll(destinations, picked) {
	if (!picked.length) return destinations;
	const byUuid = new Map(destinations.map((d) => [d.uuid, d]));
	return picked.map((uuid) => byUuid.get(uuid)).filter(Boolean);
}

// Keeps a Destination that carries any of the chosen Destination Attributes.
// No chosen Destination Attribute keeps every Destination.
function carriesAny(chosen) {
	if (!chosen.length) return () => true;
	return (d) => (d.attributes || []).some((a) => chosen.includes(a));
}
