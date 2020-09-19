import express from 'express';
import awsServerlessExpress from 'aws-serverless-express';
import awsServerlessExpressMiddleware from 'aws-serverless-express/middleware';
import cors from 'cors';
import mongoose from 'mongoose';

// Cached database connection
let dbConn = null;

// Create the app
const app = express();

// We need to set our base path for express to match on our function route
const functionName = 'work-items';
const basePath = `/.netlify/functions/${functionName}`;

// Apply the express middlewares
app.use(cors());
app.use(express.json());
app.use(awsServerlessExpressMiddleware.eventContext());





// Define the routes
app.get(`${basePath}/`, async (req, res) => {
  try {
    const items = [];

    res.json({ message: ``, data: items });
  } catch(e) {
    console.log(e);

    res.status(500).json({ message: `Hm, that broke something.`, data: null });
  }
});





// Initialize the server
const server = awsServerlessExpress.createServer(app);

// Export the lambda handler
exports.handler = async (event, context, callback) => {
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

  return awsServerlessExpress.proxy(server, event, context, 'PROMISE').promise;
}
