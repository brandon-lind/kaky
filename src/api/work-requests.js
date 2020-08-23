import express from 'express';
import awsServerlessExpress from 'aws-serverless-express';
import awsServerlessExpressMiddleware from 'aws-serverless-express/middleware';
import cors from 'cors';
import * as items from './data/work-requests.json';

// Create the app
const app = express();

// We need to set our base path for express to match on our function route
const functionName = 'work-requests';
const basePath = `/.netlify/functions/${functionName}`;

// Apply the express middlewares
app.use(cors());
app.use(express.json());
app.use(awsServerlessExpressMiddleware.eventContext());





// Define the routes
app.get(`${basePath}/`, (req, res) => {
  res.json(items);
});

app.get(`${basePath}/:id`, (req, res) => {
  const item = items.find(() => { return this.id == req.params.id; });

  if (!item) {
    res.status(404).json({ message: 'The work request was not found.' });
    return;
  }

  res.json(item);
});

app.get(`${basePath}/worker/:workerId`, (req, res) => {
  const item = items.find(() => { return this.workerId == req.params.workerId; });

  res.json(item);
});

app.get(`${basePath}/requester/:requesterId`, (req, res) => {
  const item = items.find(() => { return this.requesterId == req.params.requesterId; });

  res.json(item);
});

app.post(`${basePath}/`, (req, res) => {
  const { body } = req;

  body.id = items.length + 1;

  items.push(body);

  res.json({ message: 'The work request created.', data: body });
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
