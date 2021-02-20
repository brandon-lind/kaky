import express from 'express';
import awsServerlessExpress from 'aws-serverless-express';
import awsServerlessExpressMiddleware from 'aws-serverless-express/middleware';
import cors from 'cors';
import fetch from 'node-fetch';
import { getIdentityFromContext, userHasRole, validateUser } from './utils/authWrapper';
import { appErrorFormatter } from './utils/appErrorFormatter';
import { Worker } from './models/worker';
import * as localWorkers from './data/workers.json';

// Cached users list
let usersCache = null;

// Create the app
const app = express();

// We need to set our base path for express to match on our function route
const functionName = 'workers';
const basePath = `/.netlify/functions/${functionName}`;

// Apply the express middlewares
app.use(cors());
app.use(express.json());
app.use(awsServerlessExpressMiddleware.eventContext());





// Define the routes
app.get(`${basePath}/`, validateUser, async (req, res) => {
  try {
    const identity = getIdentityFromContext(req);

    if (!identity || !identity.url || !identity.token) {
      console.log(`Auth Failure: Could not get the identity from the request context.`);
      res.status(401).json( { message: `Nice try, but you need to be logged in.`, data: null } );
      return;
    }

    const usersUrl = `${identity.url}/admin/users`;
    const adminAuthHeader = `Bearer ${identity.token}`;
    let users = {};

    // Check if this is the development environment
    if (usersUrl === 'NETLIFY_LAMBDA_LOCALLY_EMULATED_IDENTITY_URL/admin/users') {
      users = {
        json: () => {
          return localWorkers.default;
        }
      };
    } else {
      // Check the cache ... worry about cache busting later. This only lasts for as long as the function is warm anyway.
      if (usersCache) {
        users = usersCache;
      } else {
        try {
          // Get the list of users from Netlify
          users = await fetch(usersUrl, {
            method: 'GET',
            headers: { Authorization: adminAuthHeader }
          });

          // Cache the users object
          usersCache = users;
        } catch (e) {
          console.log(`There was an error getting the list of users from Netlify at ${usersUrl}`, e);
        }
      }
    }

    // Check if there are users
    const items = users && users.json() ? users.json() : { users: [] };

    // Filter to just the workers
    const workerProfiles = items.users.filter(user => userHasRole(user, 'AcceptWork'));

    // Convert to a worker object (don't send the full profile)
    const workers = workerProfiles.map(workerProfile => {
      return new Worker(workerProfile);
    });

    res.json({ message: ``, data: workers });
  } catch(e) {
    console.log(e);

    res.status(500).json({ message: `Hm, that broke something.`, data: null });
  }
});





// Format any errors before responding
app.use(appErrorFormatter);

// Initialize the server
const server = awsServerlessExpress.createServer(app);

// Export the lambda handler
exports.handler = async (event, context) => {
  // See https://www.mongodb.com/blog/post/serverless-development-with-nodejs-aws-lambda-mongodb-atlas
  context.callbackWaitsForEmptyEventLoop = false;

  return awsServerlessExpress.proxy(server, event, context, 'PROMISE').promise;
}
