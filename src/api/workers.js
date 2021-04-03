import express from 'express';
import awsServerlessExpress from 'aws-serverless-express';
import awsServerlessExpressMiddleware from 'aws-serverless-express/middleware';
import cors from 'cors';
import fetch from 'node-fetch';
import { getIdentityFromContext, getUserFromContext, userHasRole, validateUser } from './utils/authWrapper';
import { appErrorFormatter } from './utils/appErrorFormatter';
import { Users } from './repo/users';
import { Worker } from './models/worker';

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

    const users = new Users();
    const userProfiles = await users.list(identity);

    // Filter to just the workers
    const workerUserProfiles = userProfiles.filter(user => userHasRole(user, 'AcceptWork'));

    // Convert the user profile to a worker (don't send the full profile)
    const workers = workerUserProfiles.map(workerProfile => {
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

    // Check if the user has the ManageUsers role...
    if (!userHasRole(user, 'ManageUsers')) {
      console.log(`User tried to update a worker, but didn't have the permissions: \n${JSON.stringify(user)} \n`);
      res.status(403).json({ message: `You do not have the permissions to edit the worker.`, data: null });
      return;
    }

    const worker = new Worker();
    const users = new Users();

    // Get the Worker user profile
    const workerUserProfile = await users.findById(params.id);

    // Map the submitted attributes to a Worker object
    worker.mapFromBody(body);

    // Map the worker information to the user profile
    if (workerUserProfile) {
      worker.mapToUserProfile(workerUserProfile);
    } else {
      console.log(`There was no Netlify user profile found, so it can't be updated.`, e);
      res.status(404).json({ message: `Hm, that worker was not found.`, data: null });
      return;
    }

    await users.save(workerUserProfile, identity);

    res.json({ message: `The worker was updated.`, data: worker });
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
