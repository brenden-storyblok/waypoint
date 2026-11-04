# Serve images through Storyblok's Image Service with a per-asset loader

Every Storyblok image renders with `next/image`. A `'use client'` `StoryblokImage` component takes the asset object and passes `<Image>` a `loader` that closes over that asset. Browsers fetch resized images from Storyblok's CDN, and the Next server optimizes nothing.

The loader reads the Focus Point from the asset's `focus` property. A component can ask for a crop as a `"W:H"` ratio; the loader then builds `/m/{width}x{height}` for each `srcset` width and adds `filters:focal()` if the asset has a Focus Point, or `/smart` if it doesn't. Images without a crop get `/m/{width}x0`. The loader maps Next's `quality` to `filters:quality()` and leaves the format to Storyblok, which serves WebP to browsers that support it. SVG and GIF files keep their original URL.

## Considered Options

- **Next's built-in optimizer (`/_next/image`)**: rejected. It resizes on the Next server and stores a second copy of images Storyblok already serves from a CDN.
- **A global `loaderFile`**: rejected. Next passes a loader only `src`, `width` and `quality`, so the Focus Point and crop ratio would have to ride inside `src`.
- **A server wrapper around `<Image>`**: impossible. `next/image` is a client component, and React can't pass a function prop from a Server Component to a Client Component.
- **`getImageProps()` with a native `<img>`**: rejected. The goal is to render every image with `next/image`.

## Consequences

- `StoryblokImage` ships to the browser, but Next still renders it on the server, so the HTML carries the full `src` and `srcset`.
- A component that crops sets both the `crop` prop and the matching Tailwind aspect class, and the two must agree.
- The site keeps no images in `public/`. Inline SVG icons stay hand-written markup.
- Tests and Storybook need no Next image config, because each `<Image>` gets its own loader.

## Addendum: blur placeholders for the heroes

Hero and DestinationHero show a blurred placeholder while their photo loads. Both are async Server Components. Each awaits `blurDataUrl(asset, { crop })` from `src/lib/blurDataUrl.js`, which fetches a 16px-wide version of the asset from the Image Service on the server and returns a base64 `data:` URI. The heroes pass it to `StoryblokImage` as `blurDataURL`, and `StoryblokImage` then sets `placeholder="blur"`. The utility caches each fetch for a day with `next: { revalidate }`, gives up after three seconds, and returns `undefined` on any failure, so the hero renders without a placeholder.

`storyblokImageUrl(asset, { width, crop, quality })` in `src/lib/images.js` builds every Image Service URL. The `StoryblokImage` loader and `blurDataUrl` both call it, so the placeholder gets the same crop and Focus Point as the full image. The loader stays in the client component.

- **A server wrapper around `StoryblokImage` that fetches the placeholder**: rejected. Only the heroes need placeholders, so they call the utility themselves. Cards, gallery tiles and the Header logo stay unchanged.
