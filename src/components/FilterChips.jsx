import './FilterChips.css';

/**
 * One group of Filter chips, e.g. Countries or Destination Attributes.
 * Each chip is a toggle button: aria-pressed tells screen readers whether it
 * is selected, and Enter or Space toggles it.
 *
 * Renders on the server (no onToggle: the chips show the selection but do
 * nothing until the browser takes over) and in the browser.
 *
 * Props:
 *   heading   the group's visible heading, also its accessible name
 *   chips     [{ value, label }] from a searchDestinations result's `chips`
 *   selected  [value] the selected chips
 *   onToggle  (value) => void; omit for the static render
 *
 * Renders nothing when there are no chips. A group with one chip still shows.
 */
const FilterChips = ({ heading, chips, selected, onToggle }) => {
	if (!chips.length) return null;
	return (
		<div className="filter-chips" role="group" aria-label={heading}>
			<span className="filter-chips__heading" aria-hidden="true">
				{heading}
			</span>
			{chips.map(({ value, label }) => (
				<button
					key={value}
					type="button"
					className="filter-chips__chip"
					aria-pressed={selected.includes(value)}
					onClick={onToggle ? () => onToggle(value) : undefined}
				>
					{label}
				</button>
			))}
		</div>
	);
};

export default FilterChips;
