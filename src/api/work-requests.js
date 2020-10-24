import 'dotenv/config';
import express from 'express';
import awsServerlessExpress from 'aws-serverless-express';
import awsServerlessExpressMiddleware from 'aws-serverless-express/middleware';
import cors from 'cors';
import mongoose from 'mongoose';
import { WorkRequest } from './models/work-requests';
import { netlifyAuth } from './utils/netlifyAuth';
import { appErrorFormatter } from './utils/appErrorFormatter';

// Cached database connection
let dbConn = null;

// Create the app
const app = express();

// We need to set our base path for express to match on our function route
const functionName = 'work-requests';
const basePath = `/.netlify/functions/${functionName}`;

// Apply middlewares
app.use(cors());
app.use(express.json());
app.use(awsServerlessExpressMiddleware.eventContext());




// Define the routes
app.get(`${basePath}/`, netlifyAuth, async (req, res) => {
  try {
    const items = await WorkRequest.find();

    res.json({ message: ``, data: items });
  } catch(e) {
    console.error(e);

    res.status(500).json({ message: `Hm, that broke something.`, data: null });
  }
});

app.get(`${basePath}/:id`, netlifyAuth, async (req, res) => {
  try {
    const { params } = req;
    const item = await WorkRequest.findOne({ _id: params.id });

    if (!item) {
      res.status(404).json({ message: `The work request was not found.`, data: null });
      return;
    }

    res.json({message: ``, data: item });
  } catch(e) {
    console.error(e);

    res.status(500).json({ message: `Hm, that broke something.`, data: null });
  }
});

app.get(`${basePath}/worker/:workerId`, netlifyAuth, async (req, res) => {
  try {
    const { params } = req;
    const item = await WorkRequest.findOne({ workerId: params.workerId });

    if (!item) {
      res.status(404).json({ message: `There aren't any work request associated with that worker.`, data: null });
      return;
    }

    res.json({message: ``, data: item });
  } catch(e) {
    console.error(e);

    res.status(500).json({ message: `Hm, that broke something.`, data: null });
  }
});

app.get(`${basePath}/requester/:requesterId`, netlifyAuth, async (req, res) => {
  try {
    const { params } = req;
    const item = await WorkRequest.findOne({ requesterId: params.requesterId });

    if (!item) {
      res.status(404).json({ message: `There aren't any work request associated with that requester.`, data: null });
      return;
    }

    res.json({message: ``, data: item });
  } catch(e) {
    console.error(e);

    res.status(500).json({ message: `Hm, that broke something.`, data: null });
  }
});

app.post(`${basePath}/`, netlifyAuth, async (req, res) => {
  const { body } = req;

  try {
    let item = new WorkRequest({
      workItemId: body.workItemId,
      workerId: body.workerId,
      requesterId: body.requesterId,
      price: body.price,
      instructions: body.instructions,
      status: 'open' // The only valid status is 'open'
    });

    await item.save({ isNew: true });

    res.status(201).json({ message: `The work request was created.`, data: item });
  } catch(e) {
    console.error(e);

    if (e.message.indexOf('WorkRequest validation failed:') !== -1) {
      res.status(400).json({ message: e.message, data: null });
    } else {
      res.status(500).json({ message: `Hm, that broke something.`, data: null });
    }
  }
});

app.patch(`${basePath}/:id`, netlifyAuth, async (req, res) => {
  try {
    const { body, params } = req;
    const item = await WorkRequest.findOne({ _id: params.id });

    if (!item) {
      res.status(404).json({ message: `The work request was not found.`, data: null });
      return;
    }

    // NoOp if the status is already cancelled or closed
    if (/^cancelled|closed$/gi.test(item.status)) {
      res.status(400).json({ message: `You cannot update a work request which is already cancelled or closed.`, data: null });
      return;
    }

    // Update the status
    item.status = body.status;

    await item.save();

    res.json({ message: `The work request was updated.`, data: item });
  } catch(e) {
    console.error(e);

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
        bufferMaxEntries: 0, // and MongoDB driver buffering
        dbName: process.env.MONGODB_DBNAME,
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
    }
  } catch(e) {
    console.error(e);
  }

  return awsServerlessExpress.proxy(server, event, context, 'PROMISE').promise;
}
