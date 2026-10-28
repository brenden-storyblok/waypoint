import { useEffect, useRef } from 'react';

/**
 * One Filter group as a multi-select dropdown, e.g. Countries or Destination
 * Attributes. A native <details> disclosure: the <summary> is the trigger, a
 * pill with the group heading and a "· N" badge while N options are selected.
 * A screen reader skips the badge and hears "N selected" instead.
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
 *   onClearGroup   () => void empties this group; omit for the static render
 *   clearGroupLabel  the footer Clear button's text
 *   doneLabel   the footer Done button's text; the button shows below sm only
 *
 * Renders nothing when there are no options. A group with one option still shows.
 */
const FilterSelect = ({
	heading,
	name,
	options,
	selected,
	onToggle,
	onClearGroup,
	clearGroupLabel,
	doneLabel,
}) => {
	const disclosureRef = useRef(null);

	// Close the open panel and move focus to its trigger.
	const closeAndFocusTrigger = () => {
		const disclosure = disclosureRef.current;
		if (!disclosure?.open) return;
		disclosure.open = false;
		disclosure.querySelector('summary').focus();
	};

	// Escape closes the open panel, but only while focus is inside its own
	// disclosure, so Escape in the search box leaves focus alone. A pointer
	// press outside the disclosure closes it, and a press inside leaves it open.
	useEffect(() => {
		const handleKeyDown = (event) => {
			const disclosure = disclosureRef.current;
			if (
				event.key === 'Escape' &&
				disclosure?.contains(document.activeElement)
			)
				closeAndFocusTrigger();
		};
		const handlePointerDown = (event) => {
			const disclosure = disclosureRef.current;
			if (!disclosure?.open || disclosure.contains(event.target)) return;
			disclosure.open = false;
		};
		document.addEventListener('keydown', handleKeyDown);
		document.addEventListener('pointerdown', handlePointerDown);
		return () => {
			document.removeEventListener('keydown', handleKeyDown);
			document.removeEventListener('pointerdown', handlePointerDown);
		};
	}, []);

	if (!options.length) return null;
	return (
		<details ref={disclosureRef} name="filters" className="group sm:relative">
			<summary className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-mist-200 bg-white px-4 py-2.5 font-serif text-lg text-deep-sea-900 hover:border-deep-sea-900 group-open:border-deep-sea-900 dark:border-deep-sea-700 dark:bg-deep-sea-800 dark:text-frost-200 dark:hover:border-frost-200 dark:group-open:border-frost-200 [&::-webkit-details-marker]:hidden">
				<span>{heading}</span>
				{selected.length > 0 && (
					<>
						<span aria-hidden="true">{`· ${selected.length}`}</span>
						<span className="sr-only">{` ${selected.length} selected`}</span>
					</>
				)}
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
				className="absolute inset-x-0 top-full z-10 mt-2 rounded-md border border-mist-200 bg-white p-2 shadow-lg sm:inset-x-auto sm:top-auto sm:w-70 dark:border-deep-sea-700 dark:bg-deep-sea-800"
				role="group"
				aria-label={heading}
			>
				<div className="max-h-64 overflow-y-auto">
					{options.map(({ value, label }) => (
						<label
							key={value}
							className="flex cursor-pointer items-center gap-2.5 rounded-sm px-2 py-2.5 font-serif text-base text-deep-sea-900 hover:bg-mist-100 sm:py-1.5 sm:text-sm dark:text-frost-200 dark:hover:bg-deep-sea-700"
						>
							<input
								type="checkbox"
								name={name}
								value={value}
								className="size-4.5 shrink-0 sm:size-4 cursor-pointer appearance-none rounded-sm border border-mist-200 bg-white checked:border-deep-sea-900 checked:bg-deep-sea-900 checked:bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2012%2012%22%20fill%3D%22none%22%20stroke%3D%22white%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22M2.5%206.5%205%209l4.5-5.5%22/%3E%3C/svg%3E')] checked:bg-center checked:bg-no-repeat dark:border-deep-sea-700 dark:bg-deep-sea-800 dark:checked:border-frost-200 dark:checked:bg-frost-200 dark:checked:bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2012%2012%22%20fill%3D%22none%22%20stroke%3D%22%2313232c%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22M2.5%206.5%205%209l4.5-5.5%22/%3E%3C/svg%3E')]"
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
				</div>
				<div className="mt-2 flex items-center justify-between gap-2 border-t border-mist-200 px-2 pt-2 sm:justify-end dark:border-deep-sea-700">
					<button
						type="button"
						className="cursor-pointer rounded-sm px-2 py-1 font-serif text-sm text-deep-sea-900 hover:bg-mist-100 dark:text-frost-200 dark:hover:bg-deep-sea-700"
						onClick={onClearGroup}
					>
						{clearGroupLabel}
					</button>
					<button
						type="button"
						className="cursor-pointer rounded-sm bg-deep-sea-900 px-4 py-1.5 font-serif text-sm text-white sm:hidden dark:bg-frost-200 dark:text-deep-sea-900"
						onClick={closeAndFocusTrigger}
					>
						{doneLabel}
					</button>
				</div>
			</div>
		</details>
	);
};

export default FilterSelect;
