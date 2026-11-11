# Translate at field level and put the Language in the path, except for English

Waypoint serves four Languages from one Storyblok space using field-level translation: each story exists once and its translatable fields hold a value per Language. English, the Default Language, keeps its unprefixed URLs (`/destinations/lisbon`). German, Spanish and French live under their code (`/de/destinations/lisbon`), and every Language shares the English slugs. The prefix mirrors how the Delivery API addresses a Language (`cdn/stories/de/…`) and how the Visual Editor builds preview paths, so the frontend strips the code from the path and passes it on as the `language` parameter.

Storyblok's API fills any untranslated field with the Default Language's value, so a partly translated page renders in full and the frontend carries no fallback logic. Visitors pick a Language with a switcher in the header. The site never redirects on `Accept-Language`.

## Considered Options

- **Folder-level translation (a story tree per Language)**: rejected. Destinations, FAQs and the header and footer would each need one copy per Language, and editors already reuse those records across pages.
- **A prefix on every Language, `/en` included**: rejected. It would change every URL the site already serves.
- **Translated slugs (`/de/reiseziele/lissabon`)**: deferred. They need the Translatable Slugs app and per-Language path resolution in link building and the switcher. A later change can add them without touching any English URL.
- **Redirect by `Accept-Language`**: rejected. It complicates caching, confuses crawlers and overrides visitors who followed an English link on purpose.

## Consequences

- Every Delivery API call passes the visitor's Language, including the calls `DestinationGrid` makes for its Pool and Filter labels.
- Datasource labels (Countries, Destination Attributes, UI Labels) translate through datasource dimensions named after the Language codes.
- Story links gain the current Language's prefix. Editor-typed URLs, emails and asset links render as written. Link fields are translatable, so an editor who wants a manual URL to differ by Language translates the field.
