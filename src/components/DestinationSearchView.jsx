import { Fragment } from 'react';
import FilterSelect from './FilterSelect';
import { buttonClasses } from './buttonClasses';
import { placesLabel } from '@/lib/destinationSearch';

/**
 * The searchable destination grid's markup: head with count, search box,
 * Filter dropdowns, cards, and the empty message with Clear all.
 *
 * Renders on the server as the Suspense fallback (no handlers: the search box
 * submits a plain GET form and Clear all is a link) and in the browser inside
 * DestinationSearch.
 *
 * Props:
 *   headline   the grid headline
 *   result     a searchDestinations result
 *   cards      { [uuid]: rendered DestinationCard } for every Destination in the Pool
 *   texts      { placeholder, countryLabel, attributesLabel, emptyMessage,
 *              clearLabel, clearGroupLabel, doneLabel } from the editor
 *   choices    the visitor's choices (parseChoices): the Search Text in the
 *              search box and the selected options
 *   handlers   the browser's event handlers; omit for the static fallback:
 *                onText    (text) => void
 *                onToggle  (group, value) => void toggles one option; group is
 *                          a key of result.chips, e.g. 'countries'
 *                onClear   () => void
 *                onClearGroup  (group) => void empties one Filter group
 *   clearHref  the static fallback's Clear all link (clearChoicesHref)
 */
const DestinationSearchView = ({
	headline,
	result,
	cards,
	texts,
	choices,
	handlers,
	clearHref,
}) => {
	// A small secondary Button, unfilled, in the text color.
	const clearClass = `${buttonClasses('secondary', 'sm')} cursor-pointer bg-transparent text-deep-sea-900 dark:text-frost-200`;
	const toggle = (group) =>
		handlers && ((value) => handlers.onToggle(group, value));
	const clearGroup = (group) =>
		handlers && (() => handlers.onClearGroup(group));

	return (
		<>
			<div className="mb-8 flex flex-wrap items-end justify-between gap-4">
				{headline && (
					<h2 className="font-display text-display leading-[1.05] font-extrabold tracking-[-0.01em] text-balance">
						{headline}
					</h2>
				)}
				<span
					className="font-mono text-xs text-slate-500 dark:text-slate-300"
					aria-live="polite"
				>
					{placesLabel(result)}
				</span>
			</div>
			<form
				role="search"
				className="relative mb-8 flex flex-wrap items-center gap-3"
				onSubmit={handlers ? (event) => event.preventDefault() : undefined}
			>
				<input
					type="search"
					name="q"
					className="w-full rounded-full border border-mist-200 bg-white px-4.5 py-3 font-serif text-lg text-deep-sea-900 sm:w-120 dark:border-deep-sea-700 dark:bg-deep-sea-800 dark:text-frost-200"
					aria-label={texts.placeholder}
					placeholder={texts.placeholder}
					autoComplete="off"
					{...(handlers
						? {
								value: choices.text,
								onChange: (event) => handlers.onText(event.target.value),
							}
						: { defaultValue: choices.text })}
				/>
				<FilterSelect
					heading={texts.countryLabel}
					name="country"
					options={result.chips.countries}
					selected={choices.countries}
					onToggle={toggle('countries')}
					onClearGroup={clearGroup('countries')}
					clearGroupLabel={texts.clearGroupLabel}
					doneLabel={texts.doneLabel}
				/>
				<FilterSelect
					heading={texts.attributesLabel}
					name="attribute"
					options={result.chips.attributes}
					selected={choices.attributes}
					onToggle={toggle('attributes')}
					onClearGroup={clearGroup('attributes')}
					clearGroupLabel={texts.clearGroupLabel}
					doneLabel={texts.doneLabel}
				/>
				{handlers ? (
					<button
						type="button"
						className={clearClass}
						onClick={handlers.onClear}
					>
						{texts.clearLabel}
					</button>
				) : (
					<a className={clearClass} href={clearHref}>
						{texts.clearLabel}
					</a>
				)}
			</form>
			{result.visible.length > 0 ? (
				<div className="grid grid-cols-1 gap-x-6 gap-y-7 sm:grid-cols-2 md:grid-cols-3">
					{result.visible.map((destination) => (
						<Fragment key={destination.uuid}>
							{cards[destination.uuid]}
						</Fragment>
					))}
				</div>
			) : (
				<div className="grid justify-items-start gap-4 py-8 text-slate-500 dark:text-slate-300">
					<p>{texts.emptyMessage}</p>
					{handlers ? (
						<button
							type="button"
							className={clearClass}
							onClick={handlers.onClear}
						>
							{texts.clearLabel}
						</button>
					) : (
						<a className={clearClass} href={clearHref}>
							{texts.clearLabel}
						</a>
					)}
				</div>
			)}
		</>
	);
};

export default DestinationSearchView;
