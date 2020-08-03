import * as items from './data/workitems.json';

export async function handler(event, context) {
  return {
    statusCode: 200,
    body: JSON.stringify(items)
  };
}
