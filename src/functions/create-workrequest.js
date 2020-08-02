export async function handler(event, context) {
  return {
    statusCode: 200,
    body: JSON.stringify({
      id: 1,
      workItemId: 1,
      workerId: 2,
      requesterId: ``,
      price: 7,
      instructions: `Secret Key: ${process.env.FAUNADB_SECRET}`,
      status: 'open'
    })
  };
}
