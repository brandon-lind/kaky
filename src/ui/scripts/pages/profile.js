import { Profile } from '../components/profile';

export async function profilePage() {
  const profile = new Profile();

  const formTargetEl = document.querySelector('form');
  const errorMessagesTargetEl = document.querySelector('#error-message');
  const successMessagesTargetEl = document.querySelector('#success-message');
  const actionButtonsTargetEl = document.querySelector('#actions');
  const workerprofileTargetEl = document.querySelector('#workerprofile');
  const displaynameTargetEl = document.querySelector('#displayname');
  const monogramTargetEl = document.querySelector('#monogram');
  const avatarurlTargetEl = document.querySelector('#avatarurl');
  const taglineTargetEl = document.querySelector('#tagline');
  const discordidTargetEl = document.querySelector('#discordid');
  const phonenumberTargetEl = document.querySelector('#phonenumber');
  const emailTargetEl = document.querySelector('#email');

  try {
    // Hide the worker fieldset if the user is not a worker
    if(profile.isWorker) {
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
      discordid: discordidTargetEl,
      email: emailTargetEl,
      phonenumber: phonenumberTargetEl
    });
  } catch(e) {
    console.error(e);
    actionButtonsTargetEl.remove();
  }

  formTargetEl.addEventListener('submit', async (evt) => {
    try {
      await profile.handleSubmit(evt);
      errorMessagesTargetEl.classList.add('d-none');
      successMessagesTargetEl.classList.remove('d-none');
    } catch(e) {
      successMessagesTargetEl.classList.add('d-none');
      errorMessagesTargetEl.classList.remove('d-none');
      errorMessagesTargetEl.innerHTML = e.message;
    }
  });
};
