import { useState } from 'react';
import { bloks, datasourceLabels } from '../../.storybook/fixtures';
import FilterChips from './FilterChips';

const [grid] = bloks('destinations/', 'destination_grid');

// Every entry of a datasource as a chip, in datasource order.
const chipsFrom = (datasourceSlug) =>
	Object.entries(datasourceLabels(datasourceSlug)).map(([value, label]) => ({
		value,
		label,
	}));

const countryChips = chipsFrom('countries').slice(0, 8);
const attributeChips = chipsFrom('destination-attributes');

/** One group of Filter chips, each a toggle button. Renders nothing without chips. */
const meta = {
	title: 'Search/FilterChips',
	component: FilterChips,
	args: { selected: [] },
};

export default meta;

export const Countries = {
	args: { heading: grid.country_label, chips: countryChips },
};

export const DestinationAttributes = {
	args: { heading: grid.attributes_label, chips: attributeChips },
};

export const WithSelection = {
	args: {
		heading: grid.attributes_label,
		chips: attributeChips,
		selected: ['beach', 'food'],
	},
};

/** Click a chip to toggle it. Without `onToggle` the chips only show the selection. */
export const Interactive = {
	args: { heading: grid.country_label, chips: countryChips },
	render: function Render(args) {
		const [selected, setSelected] = useState(['italy']);
		const toggle = (value) =>
			setSelected((current) =>
				current.includes(value)
					? current.filter((selectedValue) => selectedValue !== value)
					: [...current, value],
			);
		return <FilterChips {...args} selected={selected} onToggle={toggle} />;
	},
};
