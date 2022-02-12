import { Profile } from '../components/profile';

export async function indexPage() {
  const profile = new Profile();
  const parsedUrl = new URL(window.location.href);
  const hasAccessToken = parsedUrl.hash.indexOf('#access_token') !== -1;

  const formEl = document.querySelector('form');
  const googleButtonEl = document.querySelector('#googleAuth');
  const errorMessageTargetEl = document.querySelector('#error-message');
  const emailEl = document.querySelector('#email');
  const passwordEl = document.querySelector('#password');

  // If they are already logged in, get them into the app
  if (profile.user) {
    window.location = formEl.action;
    return;
  }

  // Check for an access token from the provider
  if (hasAccessToken) {
    const parsedHash = new URLSearchParams(
      window.location.hash.substr(1) // skip the first char (#)
    );

    try {
      const params = {
        access_token: parsedHash.get('access_token'),
        expires_in: parsedHash.get('expires_in'),
        refresh_token: parsedHash.get('refresh_token'),
        token_type: parsedHash.get('token_type')
      };

      await profile.handleLoginProvider(params);
      window.location = formEl.action;
    } catch(err) {
      errorMessageTargetEl.classList.remove('d-none');
      errorMessageTargetEl.textContent = `${err}`;
    }
  }


  formEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMessageTargetEl.classList.add('d-none');

    if (formEl.checkValidity() === false) {
      e.stopPropagation();
      formEl.classList.add('was-validated');
    }

    try {
      await profile.loginEmail(emailEl.value, passwordEl.value);
      window.location = formEl.action;
    } catch(err) {
      errorMessageTargetEl.classList.remove('d-none');
      errorMessageTargetEl.textContent = `${err}`;
    }

  });

  googleButtonEl.addEventListener('click', (e) => {
    e.preventDefault();
    errorMessageTargetEl.classList.add('d-none');

    profile.loginProvider('Google');
  });
};
