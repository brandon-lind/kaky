import netlifyIdentity from 'netlify-identity-widget';

class Profile {
  constructor() {

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

      // Get the user
      const user = netlifyIdentity.currentUser();

    } finally {
      setTimeout(() => {fieldsetEl.disabled = false;}, 2000);

    }

    return errorMessages;
  }
}

export { Profile };
