const validateUser = function (req, res, next) {
  // Reading the req.apiGateway.context will give us the current user.
  // Remember, you're using the awsServerlessExpressMiddleware so it wraps context in apiGateway
  const user = req.apiGateway && req.apiGateway.context && req.apiGateway.context.clientContext && req.apiGateway.context.clientContext.user;

  if (!user) {
    const err = new Error('No user or valid claims found.');
    err.status = 401;
    next(err);
  }

  next();
};

const userRoles = function (user) {
  // Attempt to fetch the roles from the Netlify JWT user data
  if (user && user.app_metadata && user.app_metadata.authorization && user.app_metadata.authorization.roles) {
    return user.app_metadata.authorization.roles;
  }

  // Look to see if there is an environment variable (i.e. localhost)
  if (process.env.AUTH_ROLES) {
    return process.env.AUTH_ROLES.split(',');
  }

  return [];
};

export { userRoles, validateUser };
