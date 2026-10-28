'use client';

import { useState } from 'react';
import DestinationSearchView from './DestinationSearchView';
import { useSearchChoices } from './useSearchChoices';
import { parseChoices, searchDestinations } from '@/lib/destinationSearch';

/**
 * The visitor's side of a searchable destination grid. Reads and writes the
 * visitor's choices in the URL and narrows the Pool with the destination
 * search module on each change.
 *
 * Props (all serialisable, from the DestinationGrid server component):
 *   headline   the grid headline
 *   pool       the Pool as destination search records
 *   labels     display labels for the module, e.g. { countries, attributes }
 *   cards      { [uuid]: rendered DestinationCard }
 *   texts      { placeholder, countryLabel, attributesLabel, emptyMessage,
 *              clearLabel, clearGroupLabel, doneLabel }
 */
const DestinationSearch = ({ headline, pool, labels, cards, texts }) => {
	const [choices, setChoices] = useSearchChoices();
	// The box keeps its own text so typing never waits on the URL sync.
	const [text, setText] = useState(choices.text);

	const shown = { ...choices, text };
	const result = searchDestinations({
		destinations: pool,
		choices: shown,
		labels,
	});

	const handlers = {
		onText: (next) => {
			setText(next);
			setChoices({ ...choices, text: next });
		},
		// Selects or deselects one chip in a Filter group (a key of choices).
		onToggle: (group, value) => {
			const selected = choices[group];
			const next = selected.includes(value)
				? selected.filter((selectedValue) => selectedValue !== value)
				: [...selected, value];
			setChoices({ ...shown, [group]: next });
		},
		// Empties one Filter group (a key of choices); the rest stay as they were.
		onClearGroup: (group) => {
			setChoices({ ...shown, [group]: [] });
		},
		onClear: () => {
			const none = parseChoices();
			setText(none.text);
			setChoices(none);
		},
	};

	return (
		<DestinationSearchView
			headline={headline}
			result={result}
			cards={cards}
			texts={texts}
			choices={shown}
			handlers={handlers}
		/>
	);
};

export default DestinationSearch;
