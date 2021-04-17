import GoTrue from 'gotrue-js';

export async function indexPage() {
  const auth = new GoTrue();
  const user = auth.currentUser();

  const formTargetEl = document.querySelector('form');
  const googleButtonEl = document.querySelector('#googleAuth');
  const errorMessageTargetEl = document.querySelector('#error-message');
  const emailEl = document.querySelector('#email');
  const passwordEl = document.querySelector('#password');

  if (user) {
    window.location = formTargetEl.action;
    return;
  }

  formTargetEl.addEventListener('submit', (e) => {
    e.preventDefault();
    errorMessageTargetEl.classList.add('d-none');

    auth
      .login(emailEl.value, passwordEl.value, true)
      .then(() => {
        window.location = formTargetEl.action;
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
