import fetch from 'node-fetch';
import * as localUsers from '../data/users.json';

/**
 * Users information from Netlify.
 */
class Users {
  constructor() {
    this.usersCache = null;
  }

  /**
   * Gets the Netlify user information from either the local cache, local file, or Netlify.
   * @param {string} userId - The user identifier to use for looking up the user.
   * @param {*} identity - The Identity object from the HTTP request context for the current caller. Used to get the Bearer token and the base Netlify Url.
   * @returns The user information.
   */
  async findById(userId, identity) {
    if (!userId) throw new Error (`No userId supplied`);

    if (!identity || !identity.url || !identity.token) {
      throw new Error(`Auth Failure: No identity supplied.`);
    }

    // Simple userId sanitization
    userId = this.sanitizeUserId(userId);

    // Check the cache
    const cachedUser = this.usersCache ? this.usersCache.find(x => x.id === userId) : null;

    if (cachedUser) {
      console.log(`Found ${userId} in the cache, so using that.`);
      return cachedUser;
    }

    // Check if this is the development environment
    if (identity.url.indexOf('netlify-dev-locally-emulated-identity') !== -1) {
      console.log(`Returning user profile ${userId} from the local file.`);
      const user = localUsers.default.users.find(x => x.id === userId);
      return user;
    }

    // Set up the Netlify endpoint info
    console.log(`Getting user ${userId} profile info from Netlify`);
    const url = `${identity.url}/admin/users/${userId}`;
    const token = `Bearer ${identity.token}`;

    // Get the user from Netlify
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      // TODO: Update cache with the user info
      return await response.json();
    } else {
      return null;
    }
  }

  /**
   * Gets the list of users from cache, local file system, or Netlify.
   * @param {*} identity - The Identity object from the HTTP request context for the current caller. Used to get the Bearer token and the base Netlify Url.
   * @returns The list of users for the Kaky application.
   */
  async list(identity) {
    if (!identity || !identity.url || !identity.token) {
      throw new Error(`Auth Failure: No identity supplied.`);
    }

    // Check if this is the development environment
    if (identity.url.indexOf('netlify-dev-locally-emulated-identity') !== -1) {
      console.log(`Getting the users from the local file system.`);
      return localUsers.default.users;
    }

    // Check the cache ... worry about cache busting later.
    if (this.usersCache) {
      console.log('Got a users cache hit!');
      return this.usersCache;
    }

    // Set up the Netlify endpoint info
    console.log(`Getting the users from Netlify`);
    const url = `${identity.url}/admin/users`;
    const token = `Bearer ${identity.token}`;

    // Get the list of users from Netlify
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    // Get the JSON from the response stream
    const responseItem = response.ok ? await response.json() : { users: [] };

    // Update the cache
    this.usersCache = Array.isArray(responseItem.users) ? responseItem.users : [];

    return this.usersCache;
  }

  /**
   * Removes any characters that aren't expected in a user identifier.
   * @param {*} userId - The user identifier to sanitize.
   * @returns A sanitized version of the user Id.
   */
  sanitizeUserId(userId) {
    return userId.replace(/[^a-zA-Z0-9\-]+/g, '');
  }

  /**
   * Saves the user profile back to Netlify.
   * @param {*} userProfile - The Netlify user object to save.
   * @param {*} identity - The Identity object from the HTTP request context for the current caller.
   */
  async save(userProfile, identity) {
    if (!userProfile) throw new Error(`There is no user profile ... cannot save to Netlify.`);

    if (!identity || !identity.url || !identity.token) {
      throw new Error(`Auth Failure: No identity supplied.`);
    }



    // Set up the Netlify endpoint info
    console.log(`Saving the user profile to Netlify`);
    const url = `${identity.url}/admin/users/${userId}`;
    const token = `Bearer ${identity.token}`;

    // Check if this is the development environment
    if (url.indexOf('netlify-dev-locally-emulated-identity') !== -1) {
      console.log(`This is the development URL, so not actually saving the user profile.`);
      return;
    }

    // Save the user changes in Netlify
    await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': token,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userProfile)
    });
  }
}

export { Users };
