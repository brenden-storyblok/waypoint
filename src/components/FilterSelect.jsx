/**
 * One Filter group as a multi-select dropdown, e.g. Countries or Destination
 * Attributes. A native <details> disclosure: the <summary> is the trigger, a
 * pill with the group heading and a "· N" badge while N options are selected.
 * The panel below holds one checkbox per option.
 *
 * Every FilterSelect shares name="filters", so the browser keeps one panel
 * open at a time.
 *
 * The checkboxes are real form fields named `name`. Render it inside a GET
 * form and the server can filter on submit before any JavaScript loads. In
 * the browser a change calls onToggle instead.
 *
 * Props:
 *   heading   the group's visible heading, also the trigger's name
 *   name      the form field name of the checkboxes, e.g. 'country'
 *   options   [{ value, label }] from a searchDestinations result's `chips`
 *   selected  [value] the selected options
 *   onToggle  (value) => void; omit for the static render
 *   onClear   () => void empties this group; omit for the static render
 *   clearLabel  the footer Clear button's text
 *
 * Renders nothing when there are no options. A group with one option still shows.
 */
const FilterSelect = ({
	heading,
	name,
	options,
	selected,
	onToggle,
	onClear,
	clearLabel,
}) => {
	if (!options.length) return null;
	return (
		<details name="filters" className="group sm:relative">
			<summary className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-mist-200 bg-white px-4 py-2.5 font-serif text-lg text-deep-sea-900 hover:border-deep-sea-900 group-open:border-deep-sea-900 dark:border-deep-sea-700 dark:bg-deep-sea-800 dark:text-frost-200 dark:hover:border-frost-200 dark:group-open:border-frost-200 [&::-webkit-details-marker]:hidden">
				<span>{heading}</span>
				{selected.length > 0 && <span>{`· ${selected.length}`}</span>}
				<svg
					className="size-3 transition-transform group-open:rotate-180"
					viewBox="0 0 12 12"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.5"
					aria-hidden="true"
				>
					<path d="M2 4.5 6 8.5 10 4.5" />
				</svg>
			</summary>
			<div
				className="absolute inset-x-0 z-10 mt-2 max-h-80 overflow-y-auto rounded-md border border-mist-200 bg-white p-2 shadow-lg sm:inset-x-auto sm:w-70 dark:border-deep-sea-700 dark:bg-deep-sea-800"
				role="group"
				aria-label={heading}
			>
				{options.map(({ value, label }) => (
					<label
						key={value}
						className="flex cursor-pointer items-center gap-2.5 rounded-sm px-2 py-2.5 font-serif text-sm text-deep-sea-900 hover:bg-mist-100 sm:py-1.5 dark:text-frost-200 dark:hover:bg-deep-sea-700"
					>
						<input
							type="checkbox"
							name={name}
							value={value}
							className="size-4 shrink-0 cursor-pointer appearance-none rounded-sm border border-mist-200 bg-white checked:border-deep-sea-900 checked:bg-deep-sea-900 dark:border-deep-sea-700 dark:bg-deep-sea-800 dark:checked:border-frost-200 dark:checked:bg-frost-200"
							{...(onToggle
								? {
										checked: selected.includes(value),
										onChange: () => onToggle(value),
									}
								: { defaultChecked: selected.includes(value) })}
						/>
						{label}
					</label>
				))}
				<div className="mt-2 flex justify-end border-t border-mist-200 px-2 pt-2 dark:border-deep-sea-700">
					<button
						type="button"
						className="cursor-pointer rounded-sm px-2 py-1 font-serif text-sm text-deep-sea-900 hover:bg-mist-100 dark:text-frost-200 dark:hover:bg-deep-sea-700"
						onClick={onClear}
					>
						{clearLabel}
					</button>
				</div>
			</div>
		</details>
	);
};

export default FilterSelect;
