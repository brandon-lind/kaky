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

  mapFromUserProfile(user) {
    if (!user) return;

    this.id = user.id || '';
    this.name = user.user_metadata.name || '';
    this.monogram = user.user_metadata.monogram || '';
    this.avatarUrl = user.user_metadata.avatarUrl || '';
    this.tagline = user.user_metadata.tagline || '';
  }
}

export { Worker };
