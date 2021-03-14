/**
 * Gets the authority URL from the request context.
 * @param {object} req - The HTTP request object.
 * @returns {string} The authority URL for the identity object (usually a Netlify Url).
 */
const getAuthUrl = function (req) {
  const identity = getIdentityFromContext(req);

  if (!identity || !identity.url) {
    throw new Error(`Auth Failure: Could not get the authorization Url from the request context.`);
  }

  return identity.url;
}

/**
 * @param {object} req - The HTTP request object.
 * @returns {string} The actual token (not including the word 'Bearer ').
 */
const getBearerToken = function (req) {
  const identity = getIdentityFromContext(req);

  if (!identity || !identity.token) {
    throw new Error(`Auth Failure: Could not get the Bearer token from the request context.`);
  }

  return identity.token;
}

/**
 * Gets the Identity information for the caller from the HTTP request.
 * @param {object} req - The HTTP request object.
 * @returns {object} The Identity object associated with the caller.
 */
const getIdentityFromContext = function (req) {
  // Remember, we're using the awsServerlessExpressMiddleware so it wraps context in apiGateway
  const identityExists = req.apiGateway &&
                   req.apiGateway.context &&
                   req.apiGateway.context.clientContext &&
                   req.apiGateway.context.clientContext.identity;

  return identityExists ? req.apiGateway.context.clientContext.identity : null;
}

/**
 * Gets the User information for the caller from the HTTP request.
 * @param {object} req - The HTTP request object.
 * @returns {object} The user information associated with the caller.
 */
const getUserFromContext = function (req) {
  // Reading the req.apiGateway.context will give us the current user.
  // Remember, we're using the awsServerlessExpressMiddleware so it wraps context in apiGateway
  const userExists = req.apiGateway &&
                     req.apiGateway.context &&
                     req.apiGateway.context.clientContext &&
                     req.apiGateway.context.clientContext.user;

  return userExists ? req.apiGateway.context.clientContext.user : null;
}

/**
 * Ensures the caller has the necessary objects in the request to validate who they are.
 * @param {object} req - The HTTP request object.
 * @param {object} res - The HTTP response object.
 * @param {function} next - The middleware next function.
 */
const validateUser = function (req, res, next) {
  const user = getUserFromContext(req);
  const token = getBearerToken(req);

  if (!user) {
    const err = new Error('No user information was found in the request payload.');
    err.status = 401;
    next(err);
  }

  if (!token) {
    const err = new Error('No Bearer token found in the request payload.');
    err.status = 401;
    next(err);
  }

  next();
};

/**
 * Checks to see if the user has been assigned to the role.
 * @param {object} user
 * @param {string} roleName
 * @returns {boolean} True if the user has the role, otherwise false.
 */
const userHasRole = function (user, roleName) {
  const roles = userRoles(user);

  return (roles && roles.indexOf(roleName) !== -1) ? true : false;
}

/**
 * Gets all of the roles associated with the user.
 * @param {object} user
 * @returns {Array} The list of roles associated with the user.
 */
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

export { getAuthUrl, getBearerToken, getIdentityFromContext, getUserFromContext, userHasRole, userRoles, validateUser };
