import netlifyIdentity from 'netlify-identity-widget';
import { ProfileNotification } from '../models/profile-notification';
import { WorkerProfile } from '../models/profile-worker';
class Profile {
  constructor() {
    this.workerProfile = new WorkerProfile();
    this.profileNotification = new ProfileNotification();
  }

  async handleSubmit(event) {
    const formEl = event.target;
    const fieldsetEl = formEl.querySelector('fieldset');
    const errorMessages = [];

    event.preventDefault();

    try {
      if (formEl.checkValidity() === false) {
        event.stopPropagation();
        formEl.classList.add('was-validated');
        return;
      }

      fieldsetEl.disabled = true;

      if (this.isWorker()) {
        try {
          await netlifyIdentity.gotrue.currentUser().update({
            data: {
                name: this.workerProfile.name,
                monogram: this.workerProfile.monogram,
                avatarUrl: this.workerProfile.avatarUrl,
                tagline: this.workerProfile.tagline
            }
          });
        } catch(e) {
          errorMessages.push('Your worker profile could not be updated.');
        }
      }

      try {
        await netlifyIdentity.gotrue.currentUser().update({
          data: {
              phonenumber: this.profileNotification.phonenumber,
              email: this.profileNotification.email
          }
        });
      } catch(e) {
        errorMessages.push('Your notification preferences could not be updated.');
      }

    } finally {
      fieldsetEl.disabled;
    }

    return errorMessages;
  }

  isWorker() {
    // Get the user
    const user = netlifyIdentity.currentUser();

    return user.app_metadata &&
            user.app_metadata.roles &&
            user.app_metadata.roles.indexOf('AcceptWork') !== -1;
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

    // Get the user
    const user = netlifyIdentity.currentUser();

    if (!user.user_metadata) return;

    this.workerProfile.mapMetadata(user.user_metadata);

    targetElements.displayname.value = this.workerProfile.name;
    targetElements.monogram.value = this.workerProfile.monogram;
    targetElements.avatarUrl.value = this.workerProfile.avatarUrl;
    targetElements.tagline.value = this.workerProfile.tagline;
  }

  renderNotifications(targetElements) {
    if (!targetElements)  throw new Error('There are no target elements to render the notifications into.');
    if (!targetElements.phonenumber)  throw new Error('There is no target element to render the phone number into.');
    if (! targetElements.email)  throw new Error('There is no target element to render the email address into.');

    targetElements.phonenumber.addEventListener('change', (e) => {
      this.profileNotification.phonenumber = e.target.value;
    });

    targetElements.email.addEventListener('change', (e) => {
      this.profileNotification.email = e.target.value;
    });

    // Get the user
    const user = netlifyIdentity.currentUser();

    if (!user.user_metadata) return;

    this.profileNotification.mapMetadata(user.user_metadata);

    targetElements.phonenumber.value = this.profileNotification.phonenumber;
    targetElements.email.value = this.profileNotification.email ?
                                  this.profileNotification.email :
                                  user.email ? user.email : '';
  }
}

export { Profile };
