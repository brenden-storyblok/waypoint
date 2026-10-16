# Style components with Tailwind utilities in markup

Each component imported its own global stylesheet with BEM class names, and `globals.css` carried tokens, base element rules and shared `wp-*` helpers. We replaced all of it with Tailwind v4 utilities written in each component's JSX, and we keep `globals.css` to the Tailwind import, `@theme` tokens, one `@layer base` rule for `:focus-visible`, and the first-party `@tailwindcss/typography` plugin with its colors mapped to the brand palette for Storyblok rich text. We follow Tailwind's defaults wherever one exists: its spacing, type and radius scales, its `sm`/`md`/`lg`/`xl` breakpoints, its `motion-safe`/`motion-reduce` variants, and body defaults as classes on `<body>`.

## Considered Options

- **React wrapper components** (`<Wrap>`, `<SectionTitle>`) for repeated helpers: rejected. We write the utilities at each call site, and only create a custom `@utility` when Tailwind has nothing that fits.
- **A hand-written `rich` utility** for Storyblok rich text: rejected. Nobody can add classes to the HTML the renderer outputs, and Tailwind's typography plugin covers that case with `prose`, its element modifiers and `dark:prose-invert`.
- **Inline `style` props** and **CSS-in-JS**: rejected. Inline styles can't express media queries or hover states, and CSS-in-JS doesn't fit React Server Components well.

## Consequences

- We snapped values that sat between Tailwind steps to the nearest step (body 17px to `text-lg`, content width 1240px to `max-w-7xl`), and pages shifted by a few pixels. Only `clamp()` sizes remain custom tokens.
- We rewrote the desktop-first 520px and 860px queries as mobile-first `sm` and `md`. Pages now render differently between 520 and 640px and between 768 and 860px.
- Tailwind only generates classes it finds as complete strings, so Layout maps each editor option to a literal class (`md:grid-cols-3`) and never builds class names from strings at runtime. The mobile-first cascade carries a Breakpoint's value up to wider screens, so Layout no longer resolves inheritance itself.
- Tests assert the classes that encode an editor's choice and stop matching full HTML strings.
