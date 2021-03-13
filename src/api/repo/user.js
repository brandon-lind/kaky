import fetch from 'node-fetch';
import * as localUsers from '../data/users.json';

// Cached users list
let usersCache = null;

const getUser = async function(identity, userId) {
  if (!identity || !identity.url || !identity.token) {
    throw new Error(`Auth Failure: No identity supplied.`);
  }

  const userUrl = `${identity.url}/admin/users/${userId}`;
  const adminAuthHeader = `Bearer ${identity.token}`;

  // Check the cache
  const cacheUser = usersCache ? usersCache.find(x => x.id === userId) : null;

  if (cacheUser) return cacheUser;

  // Check if this is the development environment
  if (identity.url === 'NETLIFY_LAMBDA_LOCALLY_EMULATED_IDENTITY_URL') {
    console.log(`Returning user profile ${userId} from the local file.`);
    const user = localUsers.default.users.find(x => x.id === userId);
    return user;
  }

  // Get the user from Netlify
  const response = await fetch(userUrl, {
    method: 'GET',
    headers: { Authorization: adminAuthHeader }
  });

  if (response.ok) {
    // TODO: Update cache with the user info
    return await response.json();
  } else {
    return null;
  }
}

const getUsers = async function (identity) {
  if (!identity || !identity.url || !identity.token) {
    throw new Error(`Auth Failure: No identity supplied.`);
  }

  const usersUrl = `${identity.url}/admin/users`;
  const adminAuthHeader = `Bearer ${identity.token}`;
  let users = {};

  // Check if this is the development environment
  if (identity.url === 'NETLIFY_LAMBDA_LOCALLY_EMULATED_IDENTITY_URL') {
    console.log('Getting the users from the local file system.');

    return localUsers.default.users;
  }

  // Check the cache ... worry about cache busting later. This only lasts for as long as the function is warm anyway.
  if (usersCache) {
    console.log('Got a users cache hit!');
    return usersCache;
  }
  console.log('Getting the users from the Netlify url');

  // Get the list of users from Netlify
  const response = await fetch(usersUrl, {
    method: 'GET',
    headers: { Authorization: adminAuthHeader }
  });

  const responseItem = response.ok ? await response.json() : { users: [] }; // Can only call this one since it's a stream

  users = Array.isArray(responseItem.users) ? responseItem.users : [];

  // Cache the users object
  usersCache = users;

  return usersCache;
}

export { getUser, getUsers };
