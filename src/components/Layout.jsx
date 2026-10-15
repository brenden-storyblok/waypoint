import {
	storyblokEditable,
	StoryblokServerComponent,
} from '@storyblok/react/rsc';
import { pickFrom } from '@/lib/pickFrom';
import './Layout.css';

const pickMode = pickFrom(['grid', 'flex']);

/** Field suffix and custom-property suffix per Breakpoint, narrowest first. */
const BREAKPOINT_SUFFIXES = [
	{ field: '', property: '' },
	{ field: '_md', property: '-md' },
	{ field: '_lg', property: '-lg' },
	{ field: '_xl', property: '-xl' },
];

const GAP_VALUES = {
	none: '0',
	xs: 'var(--space-xs)',
	sm: 'var(--space-sm)',
	md: 'var(--space-md)',
	lg: 'var(--space-lg)',
	xl: 'var(--space-xl)',
};

/** Content-sized items keep their natural width; equal items share the row. */
const ITEM_FLEX_VALUES = {
	content: '0 1 auto',
	equal: '1 1 0',
};

const mapFrom = (cssByOption) => (editorValue) => cssByOption[editorValue];

/**
 * Every Breakpoint setting a Layout can emit. `toCss` turns an editor value into
 * a CSS value, or undefined when the value is empty or unknown so the next
 * narrower Breakpoint's value carries forward. Adding a setting is a new row.
 */
const SETTINGS = [
	{
		field: 'grid_columns',
		property: '--layout-columns',
		modes: ['grid'],
		fallback: '1',
		toCss: pickFrom(['1', '2', '3', '4', '5', '6']),
	},
	{
		field: 'grid_align',
		property: '--layout-align',
		modes: ['grid'],
		fallback: 'stretch',
		toCss: pickFrom(['stretch', 'start', 'center', 'end']),
	},
	{
		field: 'flex_direction',
		property: '--layout-direction',
		modes: ['flex'],
		fallback: 'row',
		toCss: pickFrom(['row', 'column']),
	},
	{
		field: 'flex_wrap',
		property: '--layout-wrap',
		modes: ['flex'],
		fallback: 'nowrap',
		toCss: pickFrom(['wrap', 'nowrap']),
	},
	{
		field: 'flex_justify',
		property: '--layout-justify',
		modes: ['flex'],
		fallback: 'start',
		toCss: pickFrom([
			'start',
			'center',
			'end',
			'space-between',
			'space-around',
			'space-evenly',
		]),
	},
	{
		field: 'flex_align',
		property: '--layout-flex-align',
		modes: ['flex'],
		fallback: 'stretch',
		toCss: pickFrom(['stretch', 'start', 'center', 'end']),
	},
	{
		field: 'flex_item_sizing',
		property: '--layout-item-flex',
		modes: ['flex'],
		fallback: ITEM_FLEX_VALUES.content,
		toCss: mapFrom(ITEM_FLEX_VALUES),
	},
	{
		field: 'gap',
		property: '--layout-gap',
		modes: ['grid', 'flex'],
		fallback: GAP_VALUES.md,
		toCss: mapFrom(GAP_VALUES),
	},
];

/** Walks Base → md → lg → xl, carrying the last non-empty value forward. */
const resolveBreakpointProperties = (blok, mode) => {
	const properties = {};
	for (const setting of SETTINGS) {
		if (!setting.modes.includes(mode)) continue;
		let carriedValue = setting.fallback;
		for (const suffix of BREAKPOINT_SUFFIXES) {
			carriedValue =
				setting.toCss(blok[setting.field + suffix.field]) ?? carriedValue;
			properties[setting.property + suffix.property] = carriedValue;
		}
	}
	return properties;
};

const Layout = ({ blok, ...forwardedProps }) => {
	const mode = pickMode(blok.mode) ?? 'grid';

	return (
		<div
			{...storyblokEditable(blok)}
			className={`layout layout--${mode}`}
			style={resolveBreakpointProperties(blok, mode)}
		>
			{blok.items?.map((nestedBlok) => (
				<StoryblokServerComponent
					blok={nestedBlok}
					key={nestedBlok._uid}
					{...forwardedProps}
				/>
			))}
		</div>
	);
};

export default Layout;
