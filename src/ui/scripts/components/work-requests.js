import { KakyApiHeaders } from './api';
import netlifyIdentity from 'netlify-identity-widget';

class WorkRequests {
  constructor() {
    this.items = [];
    this.defaultPrice = 1;
    this.url = '/.netlify/functions/work-requests';
    this.emptyInstructionsMessage = 'You got lucky ... no special instructions this time.';
    this.workRequestInstructionsTemplate = `
    <textarea class="form-control" aria-label="Special instructions" maxlength="200"></textarea>
    `;
    this.workRequestPriceTemplate = `
    <div class="input-group mb-3">
      <div class="input-group-prepend">
        <span class="input-group-text">$</span>
      </div>
      <input type="number" required min="1" max="100" class="form-control" aria-label="Negotiated Amount" />
      <div class="invalid-feedback">
        Yeah, that's not going to work. Something between 1 and 100 will do.
      </div>
    </div>
    `;
  }

  async fetchWorkRequests(overrideCache = false) {
    if (this.item && this.items.length && !overrideCache) return this.items;

    const headers = await KakyApiHeaders.setAuthorizationHeader();
    const response = await fetch(this.url, {
      method: 'GET',
      headers: headers
    });

    if (!response.ok) {
      this.items = [];
      throw new Error(`HTTP error fetching work requests! status: ${response.status}`);
    } else {
      const items = await response.json();
      this.items = items.data;
      return this.items;
    }
  }

  async findWorkRequestById(id) {
    const headers = await KakyApiHeaders.setAuthorizationHeader();
    const response = await fetch(`${this.url}/${id}`, {
      headers: headers
    });

    if (!response.ok) {
      throw new Error(`HTTP error fetching the work request! status: ${response.status}`);
    } else {
      const item = await response.json();
      return item.data;
    }
  }

  async handleSubmit(event, errorTargetEl, workRequest) {
    const formEl = event.target;
    const fieldsetEl = formEl.querySelector('fieldset');

    try {
      fieldsetEl.disabled = true;
      event.preventDefault();

      if (!workRequest) {
        throw new Error(`There is no work request.`);
      }

      if (formEl.checkValidity() === false) {
        event.stopPropagation();
        formEl.classList.add('was-validated');
        return;
      }

      // Get the user
      const user = netlifyIdentity.currentUser();

      // Set the requester
      workRequest.requesterId = user ? user.id : '';

      // Set the status
      workRequest.status = 'open';

      // Check the work request
      this.validateWorkRequest(errorTargetEl, user, workRequest);

      try {
        const headers = await KakyApiHeaders.setPOSTHeaders();
        const response = await fetch(this.url, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(workRequest)
        });

        const responseData = await response.json();

        if (!responseData.data._id) {
          throw new Error('The work request submission failed.');
        }

        const redirectUrl = formEl.action.replace('id=#', 'id='+ responseData.data._id);
        window.location = redirectUrl;
      } catch (e) {
        console.error(`There was an error saving the work request. \n${e}`);
      }
    } finally {
      fieldsetEl.disabled = false;
    }
  }

  renderInstructions(targetEl, workRequest, editable = false, showEmptyInstructionsMessage = true) {
    if (!targetEl || targetEl.innerHTML === undefined) throw new Error('There is no target element to render the work request instructions into.');
    if (!workRequest) throw new Error('There is no work request!');

    const template = document.createElement('template');
    template.innerHTML = this.workRequestInstructionsTemplate;

    const el = template.content.cloneNode(true);
    const inputBox = el.querySelector('textarea');
    inputBox.disabled = !editable;

    if (workRequest.instructions) {
      inputBox.value = workRequest.instructions;
    } else {
      inputBox.value = showEmptyInstructionsMessage ? this.emptyInstructionsMessage : '';
    }

    inputBox.addEventListener('change', (e) => {
      workRequest.instructions = e.target.value;
    });

    targetEl.appendChild(el);
  }

  renderPrice(targetEl, workRequest, editable = false) {
    if (!targetEl || targetEl.innerHTML === undefined) throw new Error('There is no target element to render the work request price into.');
    if (!workRequest) throw new Error('There is no work request!');

    const template = document.createElement('template');
    template.innerHTML = this.workRequestPriceTemplate;

    const el = template.content.cloneNode(true);
    const inputBox = el.querySelector('input');
    inputBox.value = `${isNaN(workRequest.price) ? this.defaultPrice : workRequest.price}`;
    inputBox.disabled = !editable;

    inputBox.addEventListener('change', (e) => {
      workRequest.price = e.target.value;
    });

    targetEl.appendChild(el);
  }

  validateWorkRequest(errorTargetEl, user, workRequest) {
    if (!errorTargetEl || errorTargetEl.innerHTML === undefined) throw new Error('There is no target element to render submission error messages into.');

    const showError = (errText) => {
      errorTargetEl.innerHTML = errText;
      errorTargetEl.style.display = 'block';
    };

    if (!workRequest) {
      showError(`There was a problem. You're going to have to talk to them yourself.`);
      return;
    }

    if (!user) {
      showError(`This isn't going to work. You haven't logged in yet.`);
      return;
    } else {
      if (!user.app_metadata || !user.app_metadata.roles.find(r => r === 'AssignWork')) {
        showError(`This isn't going to work. Your profile doesn't allow assigning work.`);
        return;
      }
    }

    // Check the work request
    if (!workRequest.isValid()) {
      showError(`This isn't going to work. Things are missing from the work request.`);
      return;
    }
  }
}

export { WorkRequests };
