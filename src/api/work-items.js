import express from 'express';
import awsServerlessExpress from 'aws-serverless-express';
import awsServerlessExpressMiddleware from 'aws-serverless-express/middleware';
import cors from 'cors';
import * as rawItems from './data/work-items.json';

// Standardize items
const items = rawItems.default;

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
app.get(`${basePath}/`, (req, res) => {
  res.json({ message: '', data: items });
});





// Initialize the server
const server = awsServerlessExpress.createServer(app);

// Export the lambda handler
export function handler(event, context, callback) {
  try {
    awsServerlessExpress.proxy(server, event, context, 'CALLBACK', callback);
  } catch (e) {
    callback(null, failure({ message: 'There was an error.' }, e));
  }
}
