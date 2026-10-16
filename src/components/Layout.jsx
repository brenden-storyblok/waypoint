import {
	storyblokEditable,
	StoryblokServerComponent,
} from '@storyblok/react/rsc';
import { pickFrom } from '@/lib/pickFrom';

const pickMode = pickFrom(['grid', 'flex']);

/** Field suffix per Breakpoint, narrowest first. */
const BREAKPOINT_FIELD_SUFFIXES = ['', '_md', '_lg', '_xl'];

/** Grid align and flex align both set `align-items`. */
const ALIGN_ITEMS_CLASSES = {
	stretch: [
		'items-stretch',
		'md:items-stretch',
		'lg:items-stretch',
		'xl:items-stretch',
	],
	start: ['items-start', 'md:items-start', 'lg:items-start', 'xl:items-start'],
	center: [
		'items-center',
		'md:items-center',
		'lg:items-center',
		'xl:items-center',
	],
	end: ['items-end', 'md:items-end', 'lg:items-end', 'xl:items-end'],
};

/**
 * Every Breakpoint setting a Layout can emit. `classes` maps an editor value to
 * its class at Base, md, lg and xl, written out in full so Tailwind's scanner
 * generates each one. Base always gets a class (the fallback for an empty or
 * unknown value); a Breakpoint gets one only when the editor set a known value,
 * and the mobile-first cascade inherits the narrower value otherwise. Adding a
 * setting is a new row.
 */
const SETTINGS = [
	{
		field: 'grid_columns',
		modes: ['grid'],
		fallback: '1',
		classes: {
			1: ['grid-cols-1', 'md:grid-cols-1', 'lg:grid-cols-1', 'xl:grid-cols-1'],
			2: ['grid-cols-2', 'md:grid-cols-2', 'lg:grid-cols-2', 'xl:grid-cols-2'],
			3: ['grid-cols-3', 'md:grid-cols-3', 'lg:grid-cols-3', 'xl:grid-cols-3'],
			4: ['grid-cols-4', 'md:grid-cols-4', 'lg:grid-cols-4', 'xl:grid-cols-4'],
			5: ['grid-cols-5', 'md:grid-cols-5', 'lg:grid-cols-5', 'xl:grid-cols-5'],
			6: ['grid-cols-6', 'md:grid-cols-6', 'lg:grid-cols-6', 'xl:grid-cols-6'],
		},
	},
	{
		field: 'grid_align',
		modes: ['grid'],
		fallback: 'stretch',
		classes: ALIGN_ITEMS_CLASSES,
	},
	{
		field: 'flex_direction',
		modes: ['flex'],
		fallback: 'row',
		classes: {
			row: ['flex-row', 'md:flex-row', 'lg:flex-row', 'xl:flex-row'],
			column: ['flex-col', 'md:flex-col', 'lg:flex-col', 'xl:flex-col'],
		},
	},
	{
		field: 'flex_wrap',
		modes: ['flex'],
		fallback: 'nowrap',
		classes: {
			wrap: ['flex-wrap', 'md:flex-wrap', 'lg:flex-wrap', 'xl:flex-wrap'],
			nowrap: [
				'flex-nowrap',
				'md:flex-nowrap',
				'lg:flex-nowrap',
				'xl:flex-nowrap',
			],
		},
	},
	{
		field: 'flex_justify',
		modes: ['flex'],
		fallback: 'start',
		classes: {
			start: [
				'justify-start',
				'md:justify-start',
				'lg:justify-start',
				'xl:justify-start',
			],
			center: [
				'justify-center',
				'md:justify-center',
				'lg:justify-center',
				'xl:justify-center',
			],
			end: [
				'justify-end',
				'md:justify-end',
				'lg:justify-end',
				'xl:justify-end',
			],
			'space-between': [
				'justify-between',
				'md:justify-between',
				'lg:justify-between',
				'xl:justify-between',
			],
			'space-around': [
				'justify-around',
				'md:justify-around',
				'lg:justify-around',
				'xl:justify-around',
			],
			'space-evenly': [
				'justify-evenly',
				'md:justify-evenly',
				'lg:justify-evenly',
				'xl:justify-evenly',
			],
		},
	},
	{
		field: 'flex_align',
		modes: ['flex'],
		fallback: 'stretch',
		classes: ALIGN_ITEMS_CLASSES,
	},
	{
		/* Content-sized items keep their natural width; equal items share the row. */
		field: 'flex_item_sizing',
		modes: ['flex'],
		fallback: 'content',
		classes: {
			content: [
				'*:flex-initial',
				'md:*:flex-initial',
				'lg:*:flex-initial',
				'xl:*:flex-initial',
			],
			equal: ['*:flex-1', 'md:*:flex-1', 'lg:*:flex-1', 'xl:*:flex-1'],
		},
	},
	{
		field: 'gap',
		modes: ['grid', 'flex'],
		fallback: 'md',
		classes: {
			none: ['gap-0', 'md:gap-0', 'lg:gap-0', 'xl:gap-0'],
			xs: ['gap-2', 'md:gap-2', 'lg:gap-2', 'xl:gap-2'],
			sm: ['gap-4', 'md:gap-4', 'lg:gap-4', 'xl:gap-4'],
			md: ['gap-6', 'md:gap-6', 'lg:gap-6', 'xl:gap-6'],
			lg: ['gap-10', 'md:gap-10', 'lg:gap-10', 'xl:gap-10'],
			xl: ['gap-16', 'md:gap-16', 'lg:gap-16', 'xl:gap-16'],
		},
	},
];

/**
 * Classes every Layout of a mode gets. `min-w-0` stops a flex child's long
 * content from overflowing the row.
 */
const MODE_CLASSES = {
	grid: ['grid'],
	flex: ['flex', '*:min-w-0'],
};

const classForValue = (setting, editorValue, breakpointIndex) =>
	Object.hasOwn(setting.classes, editorValue)
		? setting.classes[editorValue][breakpointIndex]
		: undefined;

const breakpointClasses = (blok, mode) =>
	SETTINGS.filter((setting) => setting.modes.includes(mode)).flatMap(
		(setting) =>
			BREAKPOINT_FIELD_SUFFIXES.map((suffix, breakpointIndex) => {
				const editorClass = classForValue(
					setting,
					blok[setting.field + suffix],
					breakpointIndex,
				);
				if (editorClass || breakpointIndex > 0) return editorClass;
				return classForValue(setting, setting.fallback, breakpointIndex);
			}).filter(Boolean),
	);

const Layout = ({ blok, ...forwardedProps }) => {
	const mode = pickMode(blok.mode) ?? 'grid';

	return (
		<div
			{...storyblokEditable(blok)}
			className={[...MODE_CLASSES[mode], ...breakpointClasses(blok, mode)].join(
				' ',
			)}
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
