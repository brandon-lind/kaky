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

Deploy a staging preview by submitting a PR to the 'staging' branch. Netlify will build and deploy a preview from the staging branch. The Netlify site uses netlify-plugin-contextual-env (see netlify.toml) to grab the correct environment variables. The site can be acceptance tested at https://staging.kaky.us

When everything looks good, submit a PR to merge the staging branch into master and Netlify will do its thing and deploy to production.
