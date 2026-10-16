# Dark mode through `dark:` variants on palette colors

Components used to reference semantic colors (`--color-surface`, `--color-accent`), and a `prefers-color-scheme` media query reassigned those variables for dark mode. We chose Tailwind's approach: `@theme` exposes the brand palette as utilities, and each component writes both modes in its classes, e.g. `bg-white dark:bg-deep-sea-800`. Dark mode still follows the operating system setting, with no manual toggle.

## Considered Options

- **Semantic tokens that swap underneath** (`bg-surface`, `bg-accent`): rejected. It needs fewer classes and lets one variable change retheme the site, but it works against Tailwind's model, where a reader sees a component's appearance in both modes from its class list.

## Consequences

- Every color-bearing class carries a `dark:` partner, roughly 60 pairs across the components. Changing the dark surface color means editing each class that contains `dark:bg-deep-sea-800`, not one variable.
- The brand palette keeps Tailwind's built-in colors. Where a name overlaps (`slate`), we clear Tailwind's scale and keep only our shades, so `slate-100` and the other Tailwind slate shades no longer exist.
