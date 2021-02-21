class Worker {
  constructor(userProfile = null) {
    this.id = '';
    this.name = '';
    this.monogram = '';
    this.avatarUrl = '';
    this.tagline = [];

    if (userProfile) {
      this.mapFromUserProfile(userProfile);
    }
  }

  mapFromBody(body) {
    if (!body) return;

    this.id = body.id || '';
    this.name = body.name || '';
    this.monogram = body.monogram || '';
    this.avatarUrl = body.avatarUrl || '';
    this.tagline = body.tagline || '';
  }

  mapFromUserProfile(user) {
    if (!user) return;

    this.id = user.id || '';
    this.name = user.user_metadata.name || '';
    this.monogram = user.user_metadata.monogram || '';
    this.avatarUrl = user.user_metadata.avatarUrl || '';
    this.tagline = user.user_metadata.tagline || '';
  }

  mapToUserProfile(user) {
    if (!user) return;

    user.user_metadata.name = this.name;
    user.user_metadata.monogram = this.monogram;
    user.user_metadata.avatarUrl = this.avatarUrl;
    user.user_metadata.tagline = this.tagline;
  }
}

export { Worker };
