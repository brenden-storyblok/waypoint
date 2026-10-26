## Building with Waypoint

Waypoint is a travel site of European destinations. Its components come from a Next.js app styled with Tailwind v4 utilities, so you style your own layout with the same utility classes.

### Wrap every design in SiteRoot

`SiteRoot` sets the page background (`bg-mist-50`), serif body copy (`font-serif text-lg leading-relaxed`) and ink colour (`text-deep-sea-900`), with dark-mode partners. Without it, text inherits black and secondary or tertiary Buttons lose their colour.

```jsx
const { SiteRoot, Button, DestinationCard } = window.Waypoint;
<SiteRoot>{/* the whole design */}</SiteRoot>;
```

Dark mode follows the visitor's `prefers-color-scheme`. Every colour class you write needs a `dark:` partner, e.g. `bg-white dark:bg-deep-sea-800`.

### Props are Storyblok shapes

Components take what Storyblok delivers: Button takes `blok={{ variant, label, link }}`, DestinationCard takes a Destination story. Links are multilink objects, e.g. `{ linktype: 'url', url: '/destinations' }`. Read each component's `.d.ts` before using it.

### Only use classes that ship

`_ds_bundle.css` is Tailwind output compiled from Waypoint's own source, so it holds only the classes Waypoint uses. A class missing from it renders unstyled; search the file before you rely on one. Shipped vocabulary:

| Use         | Classes                                                                                                                                                                                                                                    |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Surfaces    | `bg-mist-50` (page), `bg-white` / `dark:bg-deep-sea-800` (raised), `bg-deep-sea-900` + `text-frost-100` (inverse), `bg-lagoon-700` + `text-white` (accent)                                                                                 |
| Text colour | `text-deep-sea-900` / `dark:text-frost-200` (ink), `text-slate-500` / `dark:text-slate-300` (muted), `text-lagoon-700` / `dark:text-lagoon-300` (links)                                                                                    |
| Lines       | `border-mist-200` / `dark:border-deep-sea-700`                                                                                                                                                                                             |
| Type        | `font-display` (headlines), `font-serif` (body), `font-mono` (labels); `text-hero`, `text-display`, `text-3xl`, `text-xl`, `text-lg`, `text-sm`, `text-xs`; `font-extrabold`, `font-semibold`; `tracking-widest uppercase` for mono labels |
| Layout      | `mx-auto max-w-7xl px-gutter` (content width), `py-18` (a band; `py-9` compact, `py-27` spacious), `mb-8` (headline to content), `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6` (card grid)                                        |
| Gaps        | `gap-2`, `gap-3`, `gap-4`, `gap-6`, `gap-8`, `gap-10`, `gap-16`                                                                                                                                                                            |
| Shape       | `rounded-full` (controls), `rounded-md` (photos)                                                                                                                                                                                           |

When you need a value outside that list, use an inline style with the theme variables: `var(--color-lagoon-700)`, `calc(var(--spacing) * 7)`, `var(--font-next-display)`.

### House rules

- One primary Button per view. Secondary and tertiary Buttons take their colour from the surrounding text.
- Headlines: `font-display font-extrabold text-display leading-[1.05] tracking-[-0.01em] text-balance`, in sentence case.
- Say Destination and Country, never "location" or "city". No emoji.

### Where to look

`styles.css` and `_ds_bundle.css` hold every class and variable; `components/<group>/<Name>/<Name>.d.ts` and `.prompt.md` describe each component.

```jsx
<SiteRoot>
	<section className="py-18">
		<div className="mx-auto max-w-7xl px-gutter">
			<h2 className="mb-8 font-display text-display leading-[1.05] font-extrabold tracking-[-0.01em] text-balance">
				Where our editors go back to
			</h2>
			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
				<DestinationCard destination={lisbon} href="/destinations/lisbon" />
			</div>
			<Button
				blok={{
					variant: 'primary',
					label: 'Find a destination',
					link: { linktype: 'url', url: '/destinations' },
				}}
			/>
		</div>
	</section>
</SiteRoot>
```
