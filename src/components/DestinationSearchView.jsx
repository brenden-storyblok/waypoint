import './Button.css';
import { Fragment } from 'react';
import FilterChips from './FilterChips';
import { placesLabel } from '@/lib/destinationSearch';

/**
 * The searchable destination grid's markup: head with count, search box,
 * Filter chips, cards, and the empty message with Clear all.
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
 *              clearLabel } from the editor
 *   choices    the visitor's choices (parseChoices): the Search Text in the
 *              search box and the selected chips
 *   handlers   the browser's event handlers; omit for the static fallback:
 *                onText    (text) => void
 *                onToggle  (group, value) => void toggles one chip; group is
 *                          a key of result.chips, e.g. 'countries'
 *                onClear   () => void
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
	const clearClass = 'btn btn--secondary btn--sm destination-grid__clear';
	const toggle = (group) =>
		handlers && ((value) => handlers.onToggle(group, value));

	return (
		<>
			<div className="destination-grid__head">
				{headline && <h2 className="wp-section-title">{headline}</h2>}
				<span className="destination-grid__count" aria-live="polite">
					{placesLabel(result)}
				</span>
			</div>
			<form
				role="search"
				className="destination-grid__search"
				onSubmit={handlers ? (event) => event.preventDefault() : undefined}
			>
				<input
					type="search"
					name="q"
					className="destination-grid__search-input"
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
			</form>
			<div className="destination-grid__filters">
				<FilterChips
					heading={texts.countryLabel}
					chips={result.chips.countries}
					selected={choices.countries}
					onToggle={toggle('countries')}
				/>
				<FilterChips
					heading={texts.attributesLabel}
					chips={result.chips.attributes}
					selected={choices.attributes}
					onToggle={toggle('attributes')}
				/>
			</div>
			{result.visible.length > 0 ? (
				<div className="destination-grid__cards">
					{result.visible.map((destination) => (
						<Fragment key={destination.uuid}>
							{cards[destination.uuid]}
						</Fragment>
					))}
				</div>
			) : (
				<div className="destination-grid__empty">
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
