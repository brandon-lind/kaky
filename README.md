# KAKY

A super simple chore invoicing app for (Ka)yla &amp; (Ky)le. This app is a way to teach my kids how to code and to keep track of chores and payments.

## Prerequisites

Make sure you have the following installed before starting:

- nodejs v24.13.x
- npm v11.6.x
- docker desktop

## Install

Install the application dependencies using the normal npm install routine

```
npm install
```

Install the docker MongoDB image (only need to do this once)

```
docker pull mongo:<check the infrastructure/docker-compose.yml for which version>
```

Install the Netlify CLI (see https://docs.netlify.com/cli/get-started/#app)

```
npm install netlify-cli -g
netlify login
```

## Running the App

Just tell it to start. It'll build, spool up the UI (webpack), the API (netlify lambda w/ esbuild), and the infrastructure (docker based MongoDB).

```
npm start
```

When you're done, use the normal `ctrl-c` keys

---

### Stopping the local infrastructure

You'll probably only do this to save resources when you're done working with the app, or to reset the database.

```
(cd ./infrastructure && docker-compose down --remove-orphans -v)
```

---

## Testing

Yeah, about that ...

---

## Deployment

Submit a PR to the master branch. Netlify will build and deploy a preview. The Netlify site uses netlify-plugin-contextual-env (see netlify.toml) to grab the correct environment variables. The site can be acceptance tested at the auto-generated URL Netlify will create.

When everything looks good, submit a PR to merge into master and Netlify will do its thing and deploy to production.

## Netlify Prerender Extension (GA)

Netlify has deprecated the legacy built-in prerendering feature and replaced it with the Prerender extension.

This repository is already configured for the extension runtime requirement:

- Node.js is pinned in [netlify.toml](netlify.toml) using NODE_VERSION and satisfies the extension requirement of Node.js 20+.

Project setup steps in Netlify:

1. In Netlify project settings, disable legacy prerendering at Project configuration > Build and deploy > Post processing > Prerendering.
2. Install the Netlify Prerender extension from [Netlify Extensions](https://app.netlify.com/extensions/prerender).
3. Open your project in Netlify, go to Extensions, select Prerender, and enable prerendering.
4. Save and re-deploy.

Notes:

- This feature is managed as a Netlify extension in the Netlify UI, not as an npm dependency in this repository.
- Prerender behavior and advanced options are configured from the extension settings page.
