class ProfileNotification {
  constructor(userMetadata = null) {
    this.phonenumber = '';
    this.email = '';

    this.mapMetadata(userMetadata);
  }

  mapMetadata(userMetadata) {
    if (!userMetadata) return;

    this.phonenumber = userMetadata.phonenumber || '';
    this.email = userMetadata.email || '';
  }
}

export { ProfileNotification };
