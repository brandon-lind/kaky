import 'dotenv/config';
import express from 'express';
import awsServerlessExpress from 'aws-serverless-express';
import awsServerlessExpressMiddleware from 'aws-serverless-express/middleware';
import cors from 'cors';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import { Notifier } from './utils/notifier';
import { Users } from './repo/users';
import { WorkRequest } from './models/work-requests';
import { getIdentityFromContext, getUserFromContext, userHasRole, validateUser } from './utils/authWrapper';
import { appErrorFormatter } from './utils/appErrorFormatter';

// Cached database connection
let dbConn = null;

// Create the app
const app = express();

// set up rate limiter: maximum of five requests per minute
const limiter = rateLimit({
  windowMs: 1*60*1000, // 1 minute
  max: 5
});

// apply rate limiter to all requests
app.use(limiter);

// We need to set our base path for express to match on our function route
const functionName = 'work-requests';
const basePath = `/.netlify/functions/${functionName}`;

// Apply middlewares
app.use(cors());
app.use(express.json());
app.use(awsServerlessExpressMiddleware.eventContext());




// Define the routes
app.get(`${basePath}/`, validateUser, async (req, res) => {
  try {
    const items = await WorkRequest.find();

    res.json({ message: ``, data: items });
  } catch(e) {
    console.log(e);

    res.status(500).json({ message: `Hm, that broke something.`, data: null });
  }
});

app.get(`${basePath}/:id`, validateUser, async (req, res) => {
  try {
    const { params } = req;
    const item = await WorkRequest.findOne({ _id: params.id });

    if (!item) {
      res.status(404).json({ message: `The work request was not found.`, data: null });
      return;
    }

    res.json({message: ``, data: item });
  } catch(e) {
    console.log(e);

    res.status(500).json({ message: `Hm, that broke something.`, data: null });
  }
});

app.get(`${basePath}/worker/:workerId`, validateUser, async (req, res) => {
  try {
    const { params } = req;
    const item = await WorkRequest
      .find({ workerId: params.workerId })
      .sort({ updatedAt: 'desc' })
      .exec();

    if (!item) {
      res.status(404).json({ message: `There aren't any work request associated with that worker.`, data: null });
      return;
    }

    res.json({message: ``, data: item });
  } catch(e) {
    console.log(e);

    res.status(500).json({ message: `Hm, that broke something.`, data: null });
  }
});

app.get(`${basePath}/requester/:requesterId`, validateUser, async (req, res) => {
  try {
    const { params } = req;
    const item = await WorkRequest
      .find({ requesterId: params.requesterId })
      .sort({ updatedAt: 'desc' })
      .exec();

    if (!item) {
      res.status(404).json({ message: `There aren't any work request associated with that requester.`, data: null });
      return;
    }

    res.json({message: ``, data: item });
  } catch(e) {
    console.log(e);

    res.status(500).json({ message: `Hm, that broke something.`, data: null });
  }
});

app.post(`${basePath}/`, validateUser, async (req, res) => {
  try {
    const { body } = req;
    const identity = getIdentityFromContext(req);
    const user = getUserFromContext(req);

    let item = new WorkRequest({
      workItemId: body.workItemId,
      workerId: body.workerId,
      requesterId: body.requesterId,
      price: body.price,
      instructions: body.instructions,
      status: 'open' // The only valid status is 'open'
    });

    // The requesting user must have the 'AssignWork' role
    if (!userHasRole(user, 'AssignWork')) {
      console.log(`Auth Failure: User tried to assign work, but was blocked.\n${JSON.stringify(user)}`);
      res.status(403).json( { message: `Nice try, but you do not have permission to assign work.`, data: null } );
      return;
    }

    // Save the work request
    await item.save({ isNew: true });

    // Send a message alerting the Worker of the open work request
    try {
      // Get the worker user profile
      const users = new Users();
      const userProfile = await users.findById(item.workerId, identity);

      // Create a notifier
      const notifier = new Notifier();
      console.log(`Notifying Worker ${item.workerId} about the open work request...`);
      await notifier.notifyWorkRequestStatusChanged(userProfile, item);
    } catch (notifyErr) {
      console.log(`Notification to the Worker about the open work request failed.`);
      console.log(notifyErr);
    }

    res.status(201).json({ message: `The work request was created.`, data: item });
  } catch(e) {
    console.log(e);

    if (e.message.indexOf('WorkRequest validation failed:') !== -1) {
      res.status(400).json({ message: e.message, data: null });
    } else {
      res.status(500).json({ message: `Hm, that broke something when submitting.`, data: null });
    }
  }
});

app.patch(`${basePath}/:id`, validateUser, async (req, res) => {
  try {
    const { body, params } = req;
    const identity = getIdentityFromContext(req);
    const user = getUserFromContext(req);

    // NoOp if they are trying to set a status not in this list
    if (/^cancelled|closed|paid|rejected|working|waiting_for_payment$/gi.test(body.status) === false) {
      res.status(400).json({ message: `You cannot update a work request with that status.`, data: null });
      return;
    }

    // If the user has the AssignWork role...
    if (/^cancelled|paid$/gi.test(body.status)) {
      if (!userHasRole(user, 'AssignWork')) {
        res.status(403).json({ message: `Your profile does not allow you to set that status on a work request.`, data: null });
        return;
      }
    }

    // If the user has the AcceptWork role...
    if (/^closed|rejected|working|waiting_for_payment$/gi.test(body.status)) {
      if (!userHasRole(user, 'AcceptWork')) {
        res.status(403).json({ message: `Your profile does not allow you to set that status on a work request.`, data: null });
        return;
      }
    }

    // Find the work request
    const item = await WorkRequest.findOne({ _id: params.id });

    if (!item) {
      res.status(404).json({ message: `The work request was not found.`, data: null });
      return;
    }

    // NoOp if the status is already cancelled or closed
    if (/^cancelled|closed$/gi.test(item.status)) {
      res.status(400).json({ message: `You cannot update a work request which has already been cancelled or closed.`, data: null });
      return;
    }

    // Update the status
    item.status = body.status;

    // Save the change
    await item.save();

    // Send a message alerting of the work request status change
    try {
      const users = new Users();
      const notifier = new Notifier();

      // Notify the Worker
      if (/^cancelled|paid$/gi.test(item.status)) {
        const userProfile = await users.findById(item.workerId, identity);
        console.log(`Notifying Worker ${item.workerId} about the work request ${item._id} status change to ${item.status}`);
        await notifier.notifyWorkRequestStatusChanged(userProfile, item);
      }

      // Notify the Requester
      if (/^rejected|working|waiting_for_payment$/gi.test(item.status)) {
        const userProfile = await users.findById(item.requesterId, identity);
        console.log(`Notifying Requester ${item.requesterId} about the work request ${item._id} status change to ${item.status}`);
        await notifier.notifyWorkRequestStatusChanged(userProfile, item);
      }
    } catch (notifyErr) {
      console.log(`Failed to notify about the work request status change.`);
      console.log(notifyErr);
    }

    res.json({ message: `The work request was updated.`, data: item });
  } catch(e) {
    console.log(e);

    if (e.message.indexOf('WorkRequest validation failed:') !== -1) {
      res.status(400).json({ message: e.message, data: null });
    } else {
      res.status(500).json({ message: `Hm, that broke something.`, data: null });
    }
  }
});





// Format any errors before responding
app.use(appErrorFormatter);

// Initialize the server
const server = awsServerlessExpress.createServer(app);

// Export the lambda handler
exports.handler = async (event, context) => {
  try {
    // See https://www.mongodb.com/blog/post/serverless-development-with-nodejs-aws-lambda-mongodb-atlas
    context.callbackWaitsForEmptyEventLoop = false;

    if (!dbConn) {
      dbConn = await mongoose.connect(process.env.MONGODB_URI, {
        // Buffering means mongoose will queue up operations if it gets
        // disconnected from MongoDB and send them when it reconnects.
        // With serverless, better to fail fast if not connected.
        bufferCommands: false, // Disable mongoose buffering
        dbName: process.env.MONGODB_DBNAME,
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
    }
  } catch(e) {
    console.log(e);
  }

  return awsServerlessExpress.proxy(server, event, context, 'PROMISE').promise;
}
