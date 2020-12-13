const getRequestingUser = function (req) {
  // Reading the req.apiGateway.context will give us the current user.
  // Remember, we're using the awsServerlessExpressMiddleware so it wraps context in apiGateway
  const userExists = req.apiGateway &&
                     req.apiGateway.context &&
                     req.apiGateway.context.clientContext &&
                     req.apiGateway.context.clientContext.user;

  return userExists ? req.apiGateway.context.clientContext.user : null;
}

const validateUser = function (req, res, next) {
  const user = getRequestingUser(req);

  if (!user) {
    const err = new Error('No user found in the request payload.');
    err.status = 401;
    next(err);
  }

  next();
};

const userRoles = function (user) {
  // Attempt to fetch the roles from the Netlify JWT user data
  const userRoles = user &&
                    user.app_metadata &&
                    user.app_metadata.authorization &&
                    user.app_metadata.authorization.roles;

  if (userRoles) {
    return user.app_metadata.authorization.roles;
  }

  // Look to see if there is an environment variable (i.e. localhost)
  if (process.env.AUTH_ROLES) {
    return process.env.AUTH_ROLES.split(',');
  }

  return [];
};

export { getRequestingUser, userRoles, validateUser };
