import { Profile } from '../components/profile';

export async function profilePage() {
  const profile = new Profile();

  const formTargetEl = document.querySelector('form');
  const errorMessagesTargetEl = document.querySelector('#error-messages');

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
