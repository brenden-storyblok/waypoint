import { useState } from 'react';
import { bloks, datasourceLabels } from '../../.storybook/fixtures';
import FilterSelect from './FilterSelect';

const [grid] = bloks('destinations/', 'destination_grid');

// Every entry of a datasource as an option, in datasource order.
const optionsFrom = (datasourceSlug) =>
	Object.entries(datasourceLabels(datasourceSlug)).map(([value, label]) => ({
		value,
		label,
	}));

const countryOptions = optionsFrom('countries').slice(0, 8);
const attributeOptions = optionsFrom('destination-attributes');

// Room below the trigger for its floating panel.
const withRoom = (Story) => (
	<div className="min-h-96">
		<Story />
	</div>
);

/** One Filter group as a dropdown: a pill trigger and a panel of checkboxes. Renders nothing without options. */
const meta = {
	title: 'Search/FilterSelect',
	component: FilterSelect,
	args: { selected: [] },
	decorators: [withRoom],
};

export default meta;

export const Countries = {
	args: {
		heading: grid.country_label,
		name: 'country',
		options: countryOptions,
	},
};

export const DestinationAttributes = {
	args: {
		heading: grid.attributes_label,
		name: 'attribute',
		options: attributeOptions,
	},
};

/** The trigger shows "· 2" and the ticked boxes match. Open it to see them. */
export const WithSelection = {
	args: {
		heading: grid.attributes_label,
		name: 'attribute',
		options: attributeOptions,
		selected: ['beach', 'food'],
	},
};

export const SingleOption = {
	args: { ...Countries.args, options: countryOptions.slice(0, 1) },
};

/**
 * Dark mode follows the operating system (see the dark-mode ADR). Switch the
 * browser or OS to dark to see the dark palette on any story.
 */
export const Dark = { args: WithSelection.args };

/** Tick a box to toggle it. Without `onToggle` the boxes only show the selection. */
export const Interactive = {
	args: Countries.args,
	render: function Render(args) {
		const [selected, setSelected] = useState(['italy']);
		const toggle = (value) =>
			setSelected((current) =>
				current.includes(value)
					? current.filter((selectedValue) => selectedValue !== value)
					: [...current, value],
			);
		return <FilterSelect {...args} selected={selected} onToggle={toggle} />;
	},
};
