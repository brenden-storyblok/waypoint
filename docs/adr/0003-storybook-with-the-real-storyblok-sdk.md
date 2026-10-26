# Render components in Storybook with the real Storyblok SDK

Every presentational component has Storybook stories. They render with the installed `@storyblok/react` SDK: `StoryblokServerComponent` is a synchronous component that reads the SDK's registry, so nested bloks render in the browser exactly as in the app. Storybook registers blocks by importing `src/lib/storyblok.js`. Stories take their content from `.storyblok/stories/source`, the CLI pull the repo already keeps, through `.storybook/fixtures.js`.

## Considered Options

- **A Storyblok mock aliased over `@storyblok/react/rsc`**, with its own component registry: rejected. It copied the SDK's registry and the block names, and every new block needed an entry in the mock.
- **Fixtures fetched from the Delivery API with `resolve_relations`**: rejected for now. It needs a token and network at build time, and the CLI pull is already in the repo. The fixture helpers resolve the three relations in `RESOLVE_RELATIONS` themselves.
- **Splitting components into plain-prop views and Storyblok adapters**: rejected. The split would touch every component.

## Consequences

- Async components and components that read the URL get no stories: DestinationGrid, DestinationSearch, Page and DestinationPage. Their views have stories.
- Storybook loads the site's Google fonts from `.storybook/fonts.css`, because Storybook doesn't run next/font. The decorator in `.storybook/preview.jsx` carries the root classes from `src/app/layout.js`. Both copy layout.js and need the same change when it changes.
- `npm run storybook:fixtures` regenerates the fixtures; Storybook runs it before it starts or builds.
