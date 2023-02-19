# KAKY

A super simple chore invoicing app for (Ka)yla &amp; (Ky)le. This app is a way to teach my kids how to code and to keep track of chores and payments.

## Prerequisites

Make sure you have the following installed before starting:

- nodejs v16.13.x
- npm v8.1.x
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
