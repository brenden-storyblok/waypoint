import { bloks } from '../../.storybook/fixtures';
import Layout from './Layout';

const [homeLayout] = bloks('home', 'layout');
const buttons = bloks('home', 'button').slice(0, 4);

/** An arrangement of blocks: a flex row or column, or a grid of equal columns, that can change at each Breakpoint. */
const meta = {
	title: 'Page/Layout',
	component: Layout,
	parameters: { layout: 'fullscreen' },
	decorators: [
		(Story) => (
			<div className="mx-auto max-w-7xl px-gutter py-9">
				<Story />
			</div>
		),
	],
};

export default meta;

export const FlexRow = {
	args: { blok: homeLayout },
};

export const FlexColumn = {
	args: {
		blok: {
			...homeLayout,
			items: buttons,
			flex_direction: 'column',
			flex_align: 'start',
		},
	},
};

/** Equal item sizing shares the row; space-between pushes the ends apart. */
export const FlexEqualItems = {
	args: {
		blok: {
			...homeLayout,
			items: buttons,
			flex_item_sizing: 'equal',
			flex_justify: 'space-between',
			flex_align: 'center',
			gap: 'lg',
		},
	},
};

export const GridThreeColumns = {
	args: {
		blok: {
			...homeLayout,
			mode: 'grid',
			items: buttons,
			grid_columns: '3',
			grid_columns_md: '',
		},
	},
};

/** One column on a phone, two from md, four from lg. Resize the viewport to see it. */
export const GridBreakpoints = {
	args: {
		blok: {
			...homeLayout,
			mode: 'grid',
			items: buttons,
			grid_columns: '1',
			grid_columns_md: '2',
			grid_columns_lg: '4',
			gap: 'sm',
		},
	},
};

export const Nested = {
	args: {
		blok: {
			...homeLayout,
			mode: 'grid',
			grid_columns: '1',
			grid_columns_md: '2',
			items: [
				{ ...homeLayout, _uid: 'nested-row', items: buttons.slice(0, 2) },
				{
					...homeLayout,
					_uid: 'nested-column',
					items: buttons.slice(2, 4),
					flex_direction: 'column',
					flex_align: 'start',
				},
			],
		},
	},
};
