# KAKY

A super simple chore invoicing app for (Ka)yla &amp; (Ky)le. This app is a way to teach my kids how to code and to keep track of chores and payments.

## Prerequisites

Make sure you have the following installed before starting:

- nodejs v14.8.x
- npm v6.14.x
- docker desktop
- aws-cli

## Install

Install the application dependencies using the normal npm install routine

```
npm install
```

## Running the App

Just tell it to start. It'll build, spool up the UI (webpack), the API (serverless lambda), and the infrastructure (docker based MongoDB).

```
npm start
```
>NOTE: The UI might come up before the infrastructure and API ... just wait for things to settle, then refresh the page.

When you're done, ctrl-c

---

### Stopping the local infrastructure

You'll probably only do this to save resources when you're done working with the app, or to reset the database.

```
(cd ./infrastructure && docker-compose down --remove-orphans -v)
```

---

## Testing

Yeah, about that ...

## Deployment

Deploy a staging preview by submitting a PR to the 'staging' branch. Netlify will build and deploy a preview from the staging branch. The Netlify site uses netlify-plugin-contextual-env (see netlify.toml) to grab the correct environment variables.

When everything looks good, PR the staging branch into master and Netlify will do its thing.
