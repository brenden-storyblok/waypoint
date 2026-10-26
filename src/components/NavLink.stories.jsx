import { bloks } from '../../.storybook/fixtures';
import NavLink from './NavLink';

/** A plain text link. Its parent, such as the Header nav or a FooterColumn, sets the hover style. */
const meta = {
	title: 'Site/NavLink',
	component: NavLink,
};

export default meta;

export const Default = {
	args: { blok: bloks('global/header', 'nav_link')[0] },
};
