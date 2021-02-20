import express from 'express';
import awsServerlessExpress from 'aws-serverless-express';
import awsServerlessExpressMiddleware from 'aws-serverless-express/middleware';
import cors from 'cors';
import fetch from 'node-fetch';
import { getIdentityFromContext, getUserFromContext, userHasRole, validateUser } from './utils/authWrapper';
import { appErrorFormatter } from './utils/appErrorFormatter';
import { Worker } from './models/worker';
import * as localUsers from './data/users.json';

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
    if (identity.url === 'NETLIFY_LAMBDA_LOCALLY_EMULATED_IDENTITY_URL') {
      console.log('Getting the users from the local file system.');

      users = {
        json: () => {
          return localUsers.default;
        }
      };
    } else {
      // Check the cache ... worry about cache busting later. This only lasts for as long as the function is warm anyway.
      if (usersCache) {
        users = usersCache;
        console.log('Got a users cache hit!');
      } else {
        try {
          console.log('Getting the users from the Netlify url');

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


app.patch(`${basePath}/:id`, validateUser, async (req, res) => {
  try {
    const { body, params } = req;
    const user = getUserFromContext(req);
    const identity = getIdentityFromContext(req);

    if (!identity || !identity.url || !identity.token) {
      console.log(`Auth Failure: Could not get the identity from the request context.`);
      res.status(401).json( { message: `Nice try, but you need to be logged in.`, data: null } );
      return;
    }

    const userUrl = `${identity.url}/admin/users/${params.id}`;
    const adminAuthHeader = `Bearer ${identity.token}`;
    let worker = new Worker();
    let workerUserProfile = null;

    // Check if the user has the ManageUsers role...
    if (!userHasRole(user, 'ManageUsers')) {
      console.log(`Current User: \n${JSON.stringify(user)} \n`);
      res.status(403).json({ message: `You do not have the permissions to edit the worker.`, data: null });
      return;
    }

    // Map the properties
    worker.mapFromBody(body);



    // Check if this is the development environment
    if (identity.url === 'NETLIFY_LAMBDA_LOCALLY_EMULATED_IDENTITY_URL') {
      workerUserProfile = localUsers.default.users.find(x => x.id === params.id);
    } else {
        try {
          // Get the user from Netlify
          netlifyUser = await fetch(userUrl, {
            method: 'GET',
            headers: { Authorization: adminAuthHeader }
          });

          if (netlifyUser && netlifyUser.json()) {
            workerUserProfile = netlifyUser.json();
          }

        } catch (e) {
          console.log(`There was an error getting the user from Netlify at ${userUrl}`, e);
          res.status(500).json({ message: `Hm, that broke something.`, data: null });
          return;
        }
    }

    // Map the worker information to the user profile
    if (workerUserProfile && workerUserProfile.user_metadata) {
      worker.mapToUserProfile(workerUserProfile);
    }



    // Check if this is the development environment
    if (identity.url !== 'NETLIFY_LAMBDA_LOCALLY_EMULATED_IDENTITY_URL') {
      try {
        // Update the Netlify user metadata
        netlifyUser = await fetch(userUrl, {
          method: 'PUT',
          headers: { Authorization: adminAuthHeader },
          body: JSON.stringify({ user_metadata: workerUserProfile.user_metadata})
        });
      } catch (e) {
        console.log(`There was an error updating the user metadata in Netlify at ${userUrl}`, e);
        res.status(500).json({ message: `Hm, that broke something.`, data: null });
        return;
      }
    }

    res.json({ message: `The worker was updated.`, data: worker });
  } catch(e) {
    console.error(e);
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
