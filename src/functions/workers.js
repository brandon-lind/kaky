import express from 'express';
import awsServerlessExpress from 'aws-serverless-express';
import awsServerlessExpressMiddleware from 'aws-serverless-express/middleware';
import bodyParser from 'body-parser';
import cors from 'cors';
import * as items from './data/workers.json';

const app = express();
const router = express.Router();

/* We need to set our base path for express to match on our function route */
const functionName = 'workers';
const basePath = `/.netlify/functions/${functionName}/`;





router.get('/', (req, res) => {
  throw new Error('this is just a test');
  res.json(items);
});





// Set the routes
app.use(basePath, router);

// Apply the express middlewares
router.use(cors());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(awsServerlessExpressMiddleware.eventContext());

// Initialize awsServerlessExpress
const server = awsServerlessExpress.createServer(app);

// Export lambda handler
export function handler(event, context, callback) {
  try {
    return awsServerlessExpress.proxy(server, event, context, 'CALLBACK', callback);
  } catch (e) {
    callback(null, failure({ status: false }, e));
  }
}
