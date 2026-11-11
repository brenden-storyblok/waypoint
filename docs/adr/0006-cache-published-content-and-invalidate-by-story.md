# Cache published content with ISR and invalidate by story through webhooks

Waypoint renders published content from Next's cache with Cache Components (`'use cache'`, `cacheTag`, `cacheLife`). Every cached Storyblok read uses one `cacheLife` profile that revalidates after 15 minutes. Each read sends the Cache Version as `cv`, read from `space.version` on `cdn/spaces/me` whenever a cache entry regenerates, so a refresh hits the Storyblok CDN copy of the current content. Single-story reads tag their entry `story-<id>`.

A Storyblok webhook for published, unpublished, deleted and moved stories invalidates the cache. The route verifies the webhook signature, finds the stories that reference the changed one with the Management API's `reference_search`, and revalidates `story-<id>` for the story and each story that references it. The 15-minute revalidate catches anything a webhook misses.

Visual Editor previews turn on Next's Draft Mode through a route that checks the `_storyblok_tk` token. In Draft Mode pages read draft content and skip the cache.

## Considered Options

- **Invalidate the whole space on every webhook**: rejected. One publish would re-render every page in every Language.
- **A tag per slug and a tag for filter-selected Pools**: rejected. Throwing on a missing story keeps 404s out of the cache, which covers new and moved stories. Pools selected by Country or Destination Attribute catch up within 15 minutes.
- **Store the Cache Version in its own cache entry**: rejected. Every webhook would also have to invalidate it. Reading it when an entry regenerates costs one cheap request and can't go stale.
- **Rely on the Storyblok client's in-memory `cv`**: rejected. A long-lived server instance keeps the first `cv` it saw and would refetch stale content after an invalidation.
- **Route-level `revalidate` and `fetch` options**: rejected. Cache Components is the pattern the Next 16 docs recommend for CMS content, and the Storyblok client doesn't expose its internal `fetch` options.
- **Webhooks for datasource entries**: rejected. UI Labels, Countries and Destination Attributes change rarely and reach the site within 15 minutes.

## Consequences

- Every Storyblok read goes through one content module. Components and routes never call the Storyblok client directly.
- The page passes `searchParams` down as a promise, and the grid reads it inside `<Suspense>`, so Search Text and Filters never make a page dynamic.
- The Management API client and its token live only in the webhook route.
- Pages that referenced a deleted story, and Pools selected by filter, can show stale cards for up to 15 minutes.
- The space needs a webhook pointed at the deployed route, and the deployment needs the webhook secret and a management token.
