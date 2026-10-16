/**
 * One group of Filter chips, e.g. Countries or Destination Attributes.
 * Each chip is a toggle button: aria-pressed tells screen readers whether it
 * is selected, and Enter or Space toggles it. The aria-pressed variants style
 * the selected chips.
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
		<div
			className="flex flex-wrap items-center gap-2"
			role="group"
			aria-label={heading}
		>
			<span
				className="mr-1 font-mono text-xs tracking-widest text-slate-500 uppercase dark:text-slate-300"
				aria-hidden="true"
			>
				{heading}
			</span>
			{chips.map(({ value, label }) => (
				<button
					key={value}
					type="button"
					className="cursor-pointer rounded-full border border-mist-200 bg-white px-3.5 py-1.5 font-serif text-sm/relaxed text-deep-sea-900 hover:border-deep-sea-900 aria-pressed:border-deep-sea-900 aria-pressed:bg-deep-sea-900 aria-pressed:text-frost-100 dark:border-deep-sea-700 dark:bg-deep-sea-800 dark:text-frost-200 dark:hover:border-frost-200 dark:aria-pressed:border-frost-200 dark:aria-pressed:bg-frost-200 dark:aria-pressed:text-deep-sea-950"
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
