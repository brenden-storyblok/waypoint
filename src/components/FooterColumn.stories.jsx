import { bloks } from '../../.storybook/fixtures';
import FooterColumn from './FooterColumn';

const columns = bloks('global/footer', 'footer_column');

/** A headed list of links in the Footer. Links underline on hover. */
const meta = {
	title: 'Site/FooterColumn',
	component: FooterColumn,
	decorators: [
		(Story) => (
			<div className="max-w-48">
				<Story />
			</div>
		),
	],
};

export default meta;

export const Default = {
	args: { blok: columns[1] },
};

export const SingleLink = {
	args: { blok: columns[0] },
};

export const NoHeadline = {
	args: { blok: { ...columns[1], headline: '' } },
};
