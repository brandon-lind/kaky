class ProfileNotification {
  constructor(userMetadata = null) {
    this.discordid = 0;
    this.phonenumber = '';
    this.email = '';

    this.mapMetadata(userMetadata);
  }

  mapMetadata(userMetadata) {
    if (!userMetadata) return;

    this.discordid = userMetadata.discordid || 0;
    this.phonenumber = userMetadata.phonenumber || '';
    this.email = userMetadata.email || '';
  }
}

export { ProfileNotification };
