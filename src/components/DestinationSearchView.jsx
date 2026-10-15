import './Button.css';
import { Fragment } from 'react';
import FilterChips from './FilterChips';
import { placesLabel } from '@/lib/destinationSearch';

/**
 * The searchable destination grid's markup: head with count, search box,
 * Filter chips, cards, and the empty message with Clear all.
 *
 * Renders on the server as the Suspense fallback (no handlers: the search box
 * submits a plain GET form) and in the browser inside DestinationSearch.
 *
 * Props:
 *   headline   the grid headline
 *   result     a searchDestinations result
 *   cards      { [uuid]: rendered DestinationCard } for every Destination in the Pool
 *   texts      { placeholder, countryLabel, emptyMessage, clearLabel } from
 *              the editor
 *   text       the Search Text shown in the search box
 *   choices    the visitor's choices (parseChoices), for the selected chips
 *   onText     (text) => void; omit for the static fallback
 *   onToggle   (group, value) => void toggles one chip; group is a key of
 *              result.chips, e.g. 'countries'. Omit for the static fallback
 *   onClear    () => void; omit for the static fallback
 */
const DestinationSearchView = ({
	headline,
	result,
	cards,
	texts,
	text,
	choices,
	onText,
	onToggle,
	onClear,
}) => {
	const interactive = Boolean(onText);

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
				onSubmit={interactive ? (e) => e.preventDefault() : undefined}
			>
				<input
					type="search"
					name="q"
					className="destination-grid__search-input"
					aria-label={texts.placeholder}
					placeholder={texts.placeholder}
					autoComplete="off"
					{...(interactive
						? { value: text, onChange: (e) => onText(e.target.value) }
						: { defaultValue: text })}
				/>
			</form>
			<div className="destination-grid__filters">
				<FilterChips
					heading={texts.countryLabel}
					chips={result.chips.countries}
					selected={choices.countries}
					onToggle={onToggle && ((value) => onToggle('countries', value))}
				/>
			</div>
			{result.visible.length > 0 ? (
				<div className="destination-grid__cards">
					{result.visible.map((d) => (
						<Fragment key={d.uuid}>{cards[d.uuid]}</Fragment>
					))}
				</div>
			) : (
				<div className="destination-grid__empty">
					<p>{texts.emptyMessage}</p>
					{interactive && (
						<button
							type="button"
							className="btn btn--secondary btn--sm destination-grid__clear"
							onClick={onClear}
						>
							{texts.clearLabel}
						</button>
					)}
				</div>
			)}
		</>
	);
};

export default DestinationSearchView;
