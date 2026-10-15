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
 *   labels     display labels for the module, e.g. { countries }
 *   cards      { [uuid]: rendered DestinationCard }
 *   texts      { placeholder, countryLabel, emptyMessage, clearLabel }
 */
const DestinationSearch = ({ headline, pool, labels, cards, texts }) => {
	const [choices, setChoices] = useSearchChoices();
	// The box keeps its own text so typing never waits on the URL sync.
	const [text, setText] = useState(choices.text);

	const result = searchDestinations({
		destinations: pool,
		choices: { ...choices, text },
		labels,
	});

	const onText = (next) => {
		setText(next);
		setChoices({ ...choices, text: next });
	};

	// Selects or deselects one chip in a Filter group (a key of choices).
	const onToggle = (group, value) => {
		const current = choices[group];
		const next = current.includes(value)
			? current.filter((v) => v !== value)
			: [...current, value];
		setChoices({ ...choices, text, [group]: next });
	};

	const onClear = () => {
		const none = parseChoices();
		setText(none.text);
		setChoices(none);
	};

	return (
		<DestinationSearchView
			headline={headline}
			result={result}
			cards={cards}
			texts={texts}
			text={text}
			choices={choices}
			onText={onText}
			onToggle={onToggle}
			onClear={onClear}
		/>
	);
};

export default DestinationSearch;
