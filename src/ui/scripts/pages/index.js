import GoTrue from 'gotrue-js';

export async function indexPage() {
  const auth = new GoTrue();
  const user = auth.currentUser();
  const parsedUrl = new URL(window.location.href);
  const accessToken = parsedUrl.hash;

  const formEl = document.querySelector('form');
  const googleButtonEl = document.querySelector('#googleAuth');
  const errorMessageTargetEl = document.querySelector('#error-message');
  const emailEl = document.querySelector('#email');
  const passwordEl = document.querySelector('#password');

  // If they are already logged in, get them into the app
  if (user) {
    window.location = formEl.action;
    return;
  }

  // Check for an access token from the provider
  if (accessToken) {
    const parsedHash = new URLSearchParams(
      window.location.hash.substr(1) // skip the first char (#)
    );

    // If a user already exists, this will return the existing user and not create a new one
    auth
      .createUser({
        access_token: parsedHash.get('access_token'),
        expires_in: parsedHash.get('expires_in'),
        refresh_token: parsedHash.get('refresh_token'),
        token_type: parsedHash.get('token_type')
      }, true)
      .then(() => {
        window.location = formEl.action;
      })
      .catch((err) => {
        errorMessageTargetEl.classList.remove('d-none');
        errorMessageTargetEl.innerHTML = `${err.json.error_description}`;
      });
  }


  formEl.addEventListener('submit', (e) => {
    e.preventDefault();
    errorMessageTargetEl.classList.add('d-none');

    if (formEl.checkValidity() === false) {
      e.stopPropagation();
      formEl.classList.add('was-validated');
    }

    auth
      .login(emailEl.value, passwordEl.value, true)
      .then(() => {
        window.location = formEl.action;
      })
      .catch((err) => {
        errorMessageTargetEl.classList.remove('d-none');
        errorMessageTargetEl.innerHTML = `${err.json.error_description}`;
      });
  });

  googleButtonEl.addEventListener('click', (e) => {
    e.preventDefault();
    errorMessageTargetEl.classList.add('d-none');

    window.location = auth.loginExternalUrl('Google');
  });
};
