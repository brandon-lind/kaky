class WorkerProfile {
  constructor(userMetadata = null) {
    this.name = '';
    this.monogram = '';
    this.avatarUrl = '';
    this.tagline = '';

    this.mapMetadata(userMetadata);
  }

  mapMetadata(userMetadata) {
    if (!userMetadata) return;

    this.name = userMetadata.name ?
                  userMetadata.name :
                  userMetadata.full_name ?
                    userMetadata.full_name : '';
    this.monogram = userMetadata.monogram || '';
    this.avatarUrl = userMetadata.avatarUrl || '';
    this.tagline = userMetadata.tagline || '';
  }
}

export { WorkerProfile };
