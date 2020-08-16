# KAKY

A super simple chore invoicing app for (Ka)yla &amp; (Ky)le. This app is a way to teach my kids how to code and to keep track of chores and payment.

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

### Create the local S3 bucket

- Start the local AWS S3 instance using docker compose
  ```
  npm run infrastructure
  ```
- Once started, create the local bucket
  ```
  aws --endpoint-url=http://localhost:4572 s3 mb s3://kaky
  ```

## Running the App

Just tell it to start. It'll build and spool up the app (webpack), the services (serverless lambda), and the infrastructure (localstack)

```
npm start
```

When you're done, ctrl-c

### Stopping the local AWS S3 service

You'll probably only do this to save resources or when you're done working with the app

```
(cd ./infrastructure && docker-compose down)
```

## Testing

Yeah, about that ...
