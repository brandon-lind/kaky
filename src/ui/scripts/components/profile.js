import GoTrue from 'gotrue-js';
import { ProfileNotification } from '../models/profile-notification';
import { WorkerProfile } from '../models/profile-worker';
class Profile {
  get user() { return this.auth.currentUser(); }
  get isRequester() { return this._isRequester(); }
  get isWorker() { return this._isWorker(); }

  constructor() {
    this.auth = new GoTrue();
    this.workerProfile = new WorkerProfile();
    this.profileNotification = new ProfileNotification();
  }

  _isRequester() {
    if (!this.user) return false;

    return this.user.app_metadata &&
            this.user.app_metadata.roles &&
            this.user.app_metadata.roles.indexOf('AssignWork') !== -1;
  }

  _isWorker() {
    if (!this.user) return false;

    return this.user.app_metadata &&
            this.user.app_metadata.roles &&
            this.user.app_metadata.roles.indexOf('AcceptWork') !== -1;
  }

  async loginEmail(email, password) {
    try {
      await this.auth.login(email, password, true);
    } catch(err) {
      console.log(err);
      throw new Error(err.json.error_description);
    }
  }

  async loginProvider(providerName) {
    window.location = this.auth.loginExternalUrl(providerName);
  }

  async logout() {
    if (this.user) {
      await this.user.logout();
    }
  }

  async handleLoginProvider(params) {
    // If a user already exists, this will return the existing user and not create a new one
    try {
      await this.auth.createUser(params, true);
    } catch(err) {
      console.log(err);
      throw new Error(err.json.error_description);
    }
  }

  async handleSubmit(event) {
    const formEl = event.target;
    const fieldsetEl = formEl.querySelector('fieldset');

    event.preventDefault();

    if (!this.user) {
      throw new Error(`You need to log in first!`);
    }

    if (formEl.checkValidity() === false) {
      event.stopPropagation();
      formEl.classList.add('was-validated');
      throw new Error(`You make me sad that you can't read directions. Go check for errors above.`);
    }

    fieldsetEl.disabled = true;

    if (this.isWorker) {
      try {
        await this.user.update({
          data: {
              name: this.workerProfile.name,
              monogram: this.workerProfile.monogram,
              avatarUrl: this.workerProfile.avatarUrl,
              tagline: this.workerProfile.tagline
          }
        });
      } catch(e) {
        throw new Error(`Your worker profile could not be updated.`);
      }
    }

    try {
      await this.user.update({
        data: {
            discordid: this.profileNotification.discordid,
            phonenumber: this.profileNotification.phonenumber,
            email: this.profileNotification.email
        }
      });
    } catch(e) {
      throw new Error(`Your notification preferences could not be updated.`);
    }

    fieldsetEl.disabled = false;
  }

  renderWorkerProfile(targetElements) {
    if (!targetElements)  throw new Error('There are no target elements to render the worker profile into.');
    if (!targetElements.displayname)  throw new Error('There is no target element to render the display name into.');
    if (! targetElements.monogram)  throw new Error('There is no target element to render the monogram into.');
    if (! targetElements.avatarUrl)  throw new Error('There is no target element to render the avatar URL into.');
    if (! targetElements.tagline)  throw new Error('There is no target element to render the tagline into.');

    targetElements.displayname.addEventListener('change', (e) => {
      this.workerProfile.displayname = e.target.value;
    });

    targetElements.monogram.addEventListener('change', (e) => {
      this.workerProfile.monogram = e.target.value;
    });

    targetElements.avatarUrl.addEventListener('change', (e) => {
      this.workerProfile.avatarUrl = e.target.value;
    });

    targetElements.tagline.addEventListener('change', (e) => {
      this.workerProfile.tagline = e.target.value;
    });

    if (!this.user) return;

    if (!this.user.user_metadata) return;

    this.workerProfile.mapMetadata(this.user.user_metadata);

    targetElements.displayname.value = this.workerProfile.name;
    targetElements.monogram.value = this.workerProfile.monogram;
    targetElements.avatarUrl.value = this.workerProfile.avatarUrl;
    targetElements.tagline.value = this.workerProfile.tagline;
  }

  renderNotifications(targetElements) {
    if (!targetElements)  throw new Error('There are no target elements to render the notifications into.');
    if (!targetElements.discordid)  throw new Error('There is no target element to render the Discord Id into.');
    if (!targetElements.phonenumber)  throw new Error('There is no target element to render the phone number into.');
    if (! targetElements.email)  throw new Error('There is no target element to render the email address into.');

    targetElements.discordid.addEventListener('change', (e) => {
      this.profileNotification.discordid = e.target.value;
    });

    targetElements.phonenumber.addEventListener('change', (e) => {
      this.profileNotification.phonenumber = e.target.value;
    });

    targetElements.email.addEventListener('change', (e) => {
      this.profileNotification.email = e.target.value;
    });

    if (!this.user) return;

    if (!this.user.user_metadata) return;

    this.profileNotification.mapMetadata(this.user.user_metadata);

    targetElements.discordid.value = this.profileNotification.discordid ?
                                      this.profileNotification.discordid : '';

    targetElements.phonenumber.value = this.profileNotification.phonenumber;

    targetElements.email.value = this.profileNotification.email ?
                                  this.profileNotification.email :
                                  this.user.email ? this.user.email : '';
  }
}

export { Profile };
