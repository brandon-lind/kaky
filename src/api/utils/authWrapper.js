const getIdentityFromContext = function (req) {
  // Remember, we're using the awsServerlessExpressMiddleware so it wraps context in apiGateway
  const identityExists = req.apiGateway &&
                   req.apiGateway.context &&
                   req.apiGateway.context.clientContext &&
                   req.apiGateway.context.clientContext.identity;

  return identityExists ? req.apiGateway.context.clientContext.identity : null;
}

const getUserFromContext = function (req) {
  // Reading the req.apiGateway.context will give us the current user.
  // Remember, we're using the awsServerlessExpressMiddleware so it wraps context in apiGateway
  const userExists = req.apiGateway &&
                     req.apiGateway.context &&
                     req.apiGateway.context.clientContext &&
                     req.apiGateway.context.clientContext.user;

  return userExists ? req.apiGateway.context.clientContext.user : null;
}

const validateUser = function (req, res, next) {
  const user = getUserFromContext(req);

  if (!user) {
    const err = new Error('No user information was found in the request payload.');
    err.status = 401;
    next(err);
  }

  next();
};

const userHasRole = function (user, roleName) {
  const roles = userRoles(user);

  return (roles && roles.indexOf(roleName) !== -1) ? true : false;
}

const userRoles = function (user) {
  // Attempt to fetch the roles from the Netlify JWT user data
  const userRoles = user &&
                    user.app_metadata &&
                    user.app_metadata.roles;

  if (userRoles) {
    return user.app_metadata.roles;
  }

  return [];
};

export { getIdentityFromContext, getUserFromContext, userHasRole, userRoles, validateUser };
