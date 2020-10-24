const netlifyAuth = function authenticate(req, res, next) {
  // Reading the req.apiGateway.context will give us the current user.
  // Remember, you're using the awsServerlessExpressMiddleware so it wraps context in apiGateway
  const user = req.apiGateway && req.apiGateway.context && req.apiGateway.context.clientContext && req.apiGateway.context.clientContext.user;

  if (!user) {
    const err = new Error('No user or valid claims found.');
    err.status = 401;
    next(err);
  }

  next();
}

export { netlifyAuth };
