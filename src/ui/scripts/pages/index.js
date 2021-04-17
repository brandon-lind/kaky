import GoTrue from 'gotrue-js';

export async function indexPage() {
  const auth = new GoTrue();
  const user = auth.currentUser();

  const formEl = document.querySelector('form');
  const googleButtonEl = document.querySelector('#googleAuth');
  const errorMessageTargetEl = document.querySelector('#error-message');
  const emailEl = document.querySelector('#email');
  const passwordEl = document.querySelector('#password');

  if (user) {
    window.location = formEl.action;
    return;
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
