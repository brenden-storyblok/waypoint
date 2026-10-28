import { useState } from 'react';
import {
	bloks,
	datasourceLabels,
	destinationPageHref,
	destinations,
} from '../../.storybook/fixtures';
import DestinationCard from './DestinationCard';
import DestinationSearchView from './DestinationSearchView';
import { searchDestinations } from '@/lib/destinationSearch';

const [grid] = bloks('destinations/', 'destination_grid');

// Every Destination, as the grid loads them when an editor picks none.
const pool = destinations();

// The record shape DestinationGrid hands the search module.
const records = pool.map((destination) => ({
	uuid: destination.uuid,
	name: destination.content.name,
	country: destination.content.country,
	attributes: destination.content.attributes,
}));

const labels = {
	countries: datasourceLabels('countries'),
	attributes: datasourceLabels('destination-attributes'),
};

const cards = Object.fromEntries(
	pool.map((destination) => [
		destination.uuid,
		<DestinationCard
			key={destination.uuid}
			destination={destination}
			href={destinationPageHref(destination.uuid)}
		/>,
	]),
);

const texts = {
	placeholder: grid.search_placeholder,
	countryLabel: grid.country_label,
	attributesLabel: grid.attributes_label,
	emptyMessage: grid.empty_message,
	clearLabel: grid.clear_label,
};

const noChoices = { text: '', countries: [], attributes: [] };

const searchWith = (choices) =>
	searchDestinations({ destinations: records, choices, labels });

/**
 * The searchable grid's markup: count, Search Text box, Filter dropdowns, cards and
 * the empty message. Without `handlers` it is the server's static form.
 */
const meta = {
	title: 'Search/DestinationSearchView',
	component: DestinationSearchView,
	args: { headline: grid.headline, cards, texts },
};

export default meta;

/** The whole Pool: nothing is narrowed and no trigger shows a badge. */
export const FullPool = {
	args: { result: searchWith(noChoices), choices: noChoices },
};

/** Search Text and a Country Filter narrow the Pool, so the count reads "X of Y places". */
export const Narrowed = {
	args: (() => {
		const choices = { ...noChoices, text: 'new', countries: ['united-states'] };
		return { result: searchWith(choices), choices };
	})(),
};

/** Choices in both groups: each trigger shows its "· N" badge and the boxes are ticked. */
export const ChoicesInBothGroups = {
	args: (() => {
		const choices = {
			...noChoices,
			countries: ['italy', 'spain'],
			attributes: ['beach'],
		};
		return { result: searchWith(choices), choices };
	})(),
};

/** The Country panel open, floating below its trigger. */
export const OpenPanel = {
	args: FullPool.args,
	play: ({ canvasElement }) => {
		canvasElement.querySelector('details').open = true;
	},
};

/**
 * Dark mode follows the operating system (see the dark-mode ADR). Switch the
 * browser or OS to dark to see the dark palette.
 */
export const Dark = { args: ChoicesInBothGroups.args, play: OpenPanel.play };

/** Nothing matches. The static form's Clear all is a link, set with `clearHref`. */
export const NoMatches = {
	args: (() => {
		const choices = { ...noChoices, text: 'atlantis' };
		return { result: searchWith(choices), choices, clearHref: '?' };
	})(),
};

/** With `handlers` the search box and Filter dropdowns work, as inside DestinationSearch. */
export const Interactive = {
	args: { result: searchWith(noChoices), choices: noChoices },
	render: function Render(args) {
		const [choices, setChoices] = useState(noChoices);
		const toggleIn = (group, value) =>
			setChoices((current) => ({
				...current,
				[group]: current[group].includes(value)
					? current[group].filter((selected) => selected !== value)
					: [...current[group], value],
			}));
		return (
			<DestinationSearchView
				{...args}
				result={searchWith(choices)}
				choices={choices}
				handlers={{
					onText: (text) => setChoices((current) => ({ ...current, text })),
					onToggle: toggleIn,
					onClear: () => setChoices(noChoices),
				}}
			/>
		);
	},
};
