import { Profile } from '../components/profile';

export async function profilePage() {
  const profile = new Profile();

  const formTargetEl = document.querySelector('form');
  const errorMessagesTargetEl = document.querySelector('#error-messages');
  const workerprofileTargetEl = document.querySelector('#workerprofile');
  const displaynameTargetEl = document.querySelector('#displayname');
  const monogramTargetEl = document.querySelector('#monogram');
  const avatarurlTargetEl = document.querySelector('#avatarurl');
  const taglineTargetEl = document.querySelector('#tagline');
  const phonenumberTargetEl = document.querySelector('#phonenumber');
  const emailTargetEl = document.querySelector('#email');
  const actionButtonsTargetEl = document.querySelector('#actions');

  try {
    // Hide the worker fieldset if the user is not a worker
    if(profile.isWorker()) {
      workerprofileTargetEl.classList.remove('d-none');
      profile.renderWorkerProfile({
        displayname: displaynameTargetEl,
        monogram: monogramTargetEl,
        avatarUrl: avatarurlTargetEl,
        tagline: taglineTargetEl
      });
    } else {
      workerprofileTargetEl.querySelector('.card').remove();
    }

    profile.renderNotifications({
      email: emailTargetEl,
      phonenumber: phonenumberTargetEl
    });
  } catch(e) {
    actionButtonsTargetEl.remove();
  }

  formTargetEl.addEventListener('submit', (e) => {
    const errors = profile.handleSubmit(e);

    if (errors && errors.length) {
      errorMessagesTargetEl.innerHTML = 'There were errors';
      errorMessagesTargetEl.classList.remove('d-none');
    } else {
      errorMessagesTargetEl.classList.add('d-none');
    }
  });
};
