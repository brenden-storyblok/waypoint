import './Button.css';
import { Fragment } from 'react';
import FilterChips from './FilterChips';
import { placesLabel } from '@/lib/destinationSearch';

/**
 * The searchable destination grid's markup: head with count, search box,
 * cards, and the empty message with Clear all.
 *
 * Renders on the server as the Suspense fallback (no handlers: the search box
 * submits a plain GET form) and in the browser inside DestinationSearch.
 *
 * Props:
 *   headline   the grid headline
 *   result     a searchDestinations result
 *   cards      { [uuid]: rendered DestinationCard } for every Destination in the Pool
 *   texts      { placeholder, attributesLabel, emptyMessage, clearLabel } from the editor
 *   choices    the visitor's choices; `text` is the Search Text in the search box
 *   onText     (text) => void; omit for the static fallback
 *   onToggleAttribute  (value) => void; omit for the static fallback
 *   onClear    () => void; omit for the static fallback
 */
const DestinationSearchView = ({
	headline,
	result,
	cards,
	texts,
	choices,
	onText,
	onToggleAttribute,
	onClear,
}) => {
	const { text } = choices;
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
			<FilterChips
				label={texts.attributesLabel}
				options={result.options.attributes}
				selected={choices.attributes}
				onToggle={onToggleAttribute}
			/>
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
