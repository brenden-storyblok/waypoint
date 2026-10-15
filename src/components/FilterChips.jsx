import { useId } from 'react';

/**
 * One labelled group of Filter chips. Each chip is a toggle button: its
 * `aria-pressed` tells screen readers whether it is selected, and Enter or
 * Space toggles it.
 *
 * Renders nothing when there are no options; a single option still shows.
 *
 * Props:
 *   label     the group heading, e.g. the editor's `attributes_label`
 *   options   [{ value, label }] the chips, in display order
 *   selected  [value] the selected chips
 *   onToggle  (value) => void; omit for the static fallback (chips show their
 *             state but do nothing)
 */
const FilterChips = ({ label, options, selected, onToggle }) => {
	const headingId = useId();
	if (!options.length) return null;
	const isSelected = new Set(selected);

	return (
		<div className="filter-chips" role="group" aria-labelledby={headingId}>
			<span id={headingId} className="filter-chips__label">
				{label}
			</span>
			<div className="filter-chips__list">
				{options.map((option) => (
					<button
						key={option.value}
						type="button"
						className="filter-chips__chip"
						aria-pressed={isSelected.has(option.value)}
						onClick={onToggle ? () => onToggle(option.value) : undefined}
					>
						{option.label}
					</button>
				))}
			</div>
		</div>
	);
};

export default FilterChips;
