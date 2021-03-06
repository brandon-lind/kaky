import { Profile } from './profile';

class KakyApiHeaders {
  static async setAuthorizationHeader (httpHeaders) {
    const profile = new Profile();
    const headers = (httpHeaders instanceof Headers) ? httpHeaders : new Headers();

    if (profile.user) {
      const token = await profile.user.jwt();

      if (headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
      } else {
        headers.append('Authorization', `Bearer ${token}`);
      }
    }

    return headers;
  };

  static setContentTypeJSONHeader (httpHeaders) {
    const headers = (httpHeaders instanceof Headers) ? httpHeaders : new Headers();

    if (headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    } else {
      headers.append('Content-Type', 'application/json');
    }

    return headers;
  }

  static async setPOSTHeaders (httpHeaders) {
    let headers = await this.setAuthorizationHeader(httpHeaders);
    headers = this.setContentTypeJSONHeader(headers);

    return headers;
  }
}

export { KakyApiHeaders };
