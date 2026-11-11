
# Storyblok Core Space Blueprint: Next.js

Integrate [Next.js](https://nextjs.org/) with [Storyblok](http://www.storyblok.com) as a headless CMS.

This blueprint is ideal for kickstarting new Storyblok and Next.js projects. What's inside:
- Pre-configured default blocks: `page`, `teaser`, `grid`, and `feature`.
- Support for the Visual Editor's live preview.
- Dynamic routing to fetch and render new stories automatically.
- Minimal styling.

> [!TIP]
> Follow our [Next.js guide](https://www.storyblok.com/docs/guides/nextjs/) for a step-by-step walkthrough and learn more about Storyblok's range of features, including rich text rendering, custom content modeling, and internationalization. See the [@storyblok/react package reference](https://storyblok.com/docs/packages/storyblok-react) for further information.

***

[![Open in GitHub Codespaces](https://img.shields.io/badge/Open%20in%20GitHub%20Codespaces-dad4ff.svg?style=for-the-badge&logo=GitHub&logoColor=181717&labelColor=ffffff&color=dad4ff)](https://github.com/codespaces/new?skip_quickstart=true&machine=basicLinux32gb&repo=962644002&ref=main&geo=EuropeWest)
[![Try Storyblok free](https://img.shields.io/badge/Try%20Storyblok-dad4ff.svg?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgZmlsbD0ibm9uZSI+PHBhdGggZD0iTTQuNzA3IDIuNTM4aDIyLjUyOXYyMy41ODdINC43MDd6IiBzdHlsZT0iZmlsbDojZmZmIi8+PHBhdGggZmlsbD0iIzFmMWYxZiIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMS43NDMgMi42MDFBMi41OTcgMi41OTcgMCAwIDEgNC4zMzUgMGgyMy4zM2EyLjU5NyAyLjU5NyAwIDAgMSAyLjU5MiAyLjYwMXYyMy40MTFhMi41OTcgMi41OTcgMCAwIDEtMi41OTIgMi42MDJIMTIuNTQ4bC0zLjg3MiAzLjIwOGEuNzcuNzcgMCAwIDEtMS4yNjEtLjU5N3YtMi42MTFoLTMuMDhhMi41OTcgMi41OTcgMCAwIDEtMi41OTItMi42MDJabTUuNjcgMi4xMjdoMTIuNDYyYzIuNjkxIDAgNC44NzMgMi4xOSA0Ljg3MyA0Ljg5IDAgMi4xNjQtMS40IDQtMy4zNDIgNC42NDRhNC44ODcgNC44ODcgMCAwIDEgMy45OSA0LjgxYzAgMi43MDEtMi4xODEgNC44OS00Ljg3MyA0Ljg5SDcuNDEzdi05LjQ1NFptMTAuMzY0IDQuNEgxMS45NXYyLjkzNGg1LjgyOGMuODA4IDAgMS40NjItLjY1NiAxLjQ2Mi0xLjQ2NyAwLS44MS0uNjU0LTEuNDY3LTEuNDYyLTEuNDY3em0tNS44MjggNi41Mmg2LjMxNGMuODk3IDAgMS42MjQuNzMgMS42MjQgMS42MyAwIC45MDEtLjcyNyAxLjYzLTEuNjI0IDEuNjNoLTYuMzE0eiIgY2xpcC1ydWxlPSJldmVub2RkIiBzdHlsZT0ic3Ryb2tlLXdpZHRoOjEuNTE3NzUiLz48L3N2Zz4K&labelColor=ffffff)](https://app.storyblok.com/#/signup)
[![Join the Storyblok Discord community](https://img.shields.io/discord/700316478792138842?style=for-the-badge&logo=discord&label=Join%20our%20community&labelColor=ffffff&color=dad4ff)](https://storyblok.com/join-discord)

## Get Started

**No Storyblok account yet? [Sign up now](https://app.storyblok.com/#/signup?utm_source=docs) to experience a 14-day free trial of all features and enjoy our completely free Starter plan.**

1. Create an empty new Storyblok space
2. Create a new repository based on this template
3. Open the project on your device
4. Install dependencies

```sh
npm install
```

### Authentication

In the root of the project, create a `.env` file to store the Storyblok access token:

```sh
STORYBLOK_DELIVERY_API_TOKEN=<REPLACE_WITH_YOUR_TOKEN>
```

> [!IMPORTANT]
> Copy your space's preview access token from **Settings** > **Access Tokens**.
> Learn more about Storyblok [access tokens](https://www.storyblok.com/docs/concepts/access-tokens).

### Environment variables

Copy `.env.example` to `.env` and fill in the values. Set the same variables in the deployment.

| Variable | Purpose |
| --- | --- |
| `STORYBLOK_DELIVERY_API_TOKEN` | Preview access token for the Delivery API. |
| `STORYBLOK_SPACE_ID` | Numeric ID of the Storyblok space. |
| `STORYBLOK_REGION` | Region of the space: `eu`, `us`, `cn`, `ap` or `ca`. |
| `STORYBLOK_API_BASE_URL` | Only for spaces created from the Blueprints feature. |
| `STORYBLOK_WEBHOOK_SECRET` | Shared secret that signs Storyblok webhooks. Server only. |
| `STORYBLOK_MANAGEMENT_TOKEN` | Personal access token for the Management API. Server only. |

`STORYBLOK_WEBHOOK_SECRET` and `STORYBLOK_MANAGEMENT_TOKEN` are read only by the webhook route at `/api/revalidate`. Never add them to the `env` block in `next.config.mjs`, which would put them in the browser bundle.

### Set up the revalidation webhook

Published content is cached. A Storyblok webhook tells the site which cached pages to refresh when an editor changes a story.

1. Create a personal access token in your Storyblok account settings and set it as `STORYBLOK_MANAGEMENT_TOKEN`. The route uses it to find the stories that reference the changed story.
2. Choose a secret, for example the output of `openssl rand -hex 32`, and set it as `STORYBLOK_WEBHOOK_SECRET`.
3. In the space, go to **Settings > Webhooks** and create a webhook:
   - **Endpoint URL**: `https://<your-deployment>/api/revalidate`
   - **Secret**: the same value as `STORYBLOK_WEBHOOK_SECRET`
   - **Triggers**: under Story, select **Story published**, **Story unpublished**, **Story deleted** and **Story moved**.
4. Leave the datasource triggers off. The route ignores other events, and datasource changes reach the site within 15 minutes.

The route checks the `webhook-signature` header, an HMAC-SHA1 hex digest of the raw request body, and answers `401` without a valid one. If it cannot reach the Management API, it still refreshes the changed story and answers `502`, so Storyblok retries the delivery. Webhook secrets need a Storyblok plan that supports them.

### Connect the Visual Editor

To render a preview of the local project in the Visual Editor, follow these steps:

1. Navigate to **Settings > Visual Editor**.
2. Set the default environment to `https://localhost:3000/`.
3. Save.
4. Open the `home` story.
5. Click **Config**.
6. Type `/` in the **Real path**.

Run the development server with HTTPS enabled:
```sh
npx next dev --experimental-https
```

> [!IMPORTANT]
> To connect the Storyblok Visual Editor, the local project must run over HTTPS. Learn more in the [Visual Editor concept](https://www.storyblok.com/docs/concepts/visual-editor#local-development-via-https).

Back in Storyblok, open the **Home** story to start editing.

Happy building!

## Restore the content to a new space

The `.storyblok/` directory holds a copy of the space content in a `source` folder per type: `datasources/source`, `assets/source`, `components/source` and `stories/source`. You can push that copy into a new, empty space with the [Storyblok CLI](https://www.storyblok.com/docs/tooling/cli). You need the ID of the new space only.

Log in first, in the same region as the new space:

```sh
storyblok login
```

Then push in this order, replacing `<NEW_SPACE_ID>` with the ID of the new space. `--from source` tells the CLI to read the local files from the `source` folders.

```sh
# 1. Datasources: components can read their options from a datasource
storyblok datasources push --from source --space <NEW_SPACE_ID>

# 2. Assets: the push writes a manifest that maps old asset IDs to new ones
storyblok assets push --from source --space <NEW_SPACE_ID>

# 3. Components: stories need their content types to exist
storyblok components push --from source --space <NEW_SPACE_ID>

# 4. Stories: the push uses the asset manifest to rewrite asset references
storyblok stories push --from source --space <NEW_SPACE_ID> --dry-run
storyblok stories push --from source --space <NEW_SPACE_ID>
```

> [!TIP]
> `assets push` and `stories push` accept `--dry-run`. Run it first to preview what the push creates. Add `--publish` to `stories push` to publish every story it creates.

> [!IMPORTANT]
> Keep the `manifest.jsonl` files under `.storyblok/assets/` and `.storyblok/stories/`. The CLI reads them to update what it already created, so a second push does not duplicate assets or stories.

To refresh the copy from the original space, pull each type and move the result into `source`. The CLI writes pulls to a folder named after the space ID, so `storyblok stories pull --space <ORIGINAL_SPACE_ID>` lands in `.storyblok/stories/<ORIGINAL_SPACE_ID>`.

See the CLI reference for each command:
[`datasources push`](https://www.storyblok.com/docs/tooling/cli/datasources/push),
[`assets push`](https://www.storyblok.com/docs/tooling/cli/assets/push),
[`components push`](https://www.storyblok.com/docs/tooling/cli/components/push) and
[`stories push`](https://www.storyblok.com/docs/tooling/cli/stories/push).

## Resources

- To learn more about what you can do with Storyblok, visit [our documentation and learning hub](https://www.storyblok.com/docs).
- To learn more about the integration between Storyblok and Next.js, check our [dedicated developer tutorials](https://www.storyblok.com/tutorials?technologies=next).
- To learn more about Next.js, check the [official documentation](https://nextjs.org/docs).

### Support

- Have questions, need help, want to chat with other users? [Join our Discord community](https://storyblok.com/join-discord).
- Visit the Storyblok [Help Center](https://support.storyblok.com/hc/en-us).
