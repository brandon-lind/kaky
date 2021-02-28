import { KakyApiHeaders } from './api';
import { Profile } from './profile';
import { Workers } from './workers';
import { WorkRequest } from '../models/work-request';

class WorkRequests {
  constructor() {
    this.items = [];
    this.defaultPrice = 1;
    this.url = '/.netlify/functions/work-requests';
    this.workRequestDetailsUrl = '/work-requests/detail.html?id=#';
    this.workers = new Workers();
    this.profile = new Profile();
    this.emptyInstructionsMessage = 'You got lucky ... no special instructions this time.';
    this.workRequestInstructionsTemplate = `
    <textarea class="form-control" aria-label="Special instructions" maxlength="200"></textarea>
    <div class="invalid-feedback">
      Whoa, that is too much for them to process with their short attention span. Try less words.
    </div>
    `;
    this.workRequestPriceTemplate = `
    <div class="input-group mb-3">
      <div class="input-group-prepend">
        <span class="input-group-text">$</span>
      </div>
      <input type="number" required min="1" max="100" class="form-control" aria-label="Negotiated Amount" />
      <div class="invalid-feedback">
        Whoa, that won't work. You can use something between $1 and $100.
      </div>
    </div>
    `;
    this.workRequestStatusTemplate = `<li class="workrequest-status list-group-item list-group-item-action flex-column align-items-start">
    <div class="d-flex w-100 mb-1">
      <div class="worker-logo position-absolute"></div>
      <div class="img-parent mr-3">
        <img class="img-fluid img-thumbnail" />
      </div>
      <div class="align-items-center">
        <h5 class="mb-0"></h5>
        <strong class="text-muted"></strong>
        <br />
        <small class="text-muted"></small>
      </div>
    </div>
    <a href="#" class="stretched-link"></a>
    <p class="alert alert-info" role="alert"></p>
  </li>`;
  }

  async add(workRequest) {
    if (!this.profile.user) {
      throw new Error(`This isn't going to work. You haven't logged in yet.`);
    }

    // Set the requester
    workRequest.requesterId = this.profile.user ? this.profile.user.id : '';

    // Set the status
    workRequest.status = 'open';

    // Check the work request
    this.validateWorkRequest(this.profile.user, workRequest);

    try {
      const headers = await KakyApiHeaders.setPOSTHeaders();
      const response = await fetch(this.url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(workRequest)
      });

      const responseData = await response.json();

      if (responseData.data._id) {
        return responseData.data._id;
      } else {
        throw new Error(`The work request submission failed.`);
      }
    } catch (e) {
      console.error(`There was an error saving the work request. \n${e}`);
      throw new Error(`There was an error saving the work request.`);
    }
  }

  cloneWorkRequestForReorder(workRequest) {
    let clone = new WorkRequest(workRequest);
    delete clone._id;
    delete clone.__v;
    delete clone.createdAt;
    delete clone.updatedAt;

    return clone;
  }

  createStatusNode(workRequest, workItem, worker) {
    const template = document.createElement('template');
    template.innerHTML = this.workRequestStatusTemplate;
    const statusNode = template.content.cloneNode(true);

    const itemEl = statusNode.querySelector('li');
    const imgEl = statusNode.querySelector('img');
    const instructionsEl = statusNode.querySelector('.alert-info');
    const linkEl = statusNode.querySelector('a');
    const logoEl = statusNode.querySelector('.worker-logo');
    const priceEl = statusNode.querySelector('strong.text-muted');
    const timestampEl = statusNode.querySelector('small.text-muted');
    const titleEl = statusNode.querySelector('h5');

    // Calculate how many days ago the request was submitted
    const today = new Date();
    const createdAt = new Date(workRequest.createdAt);
    const msPerDay = (1000*60*60*24);
    const daysAgo = Math.floor(Math.abs((today.getTime() - createdAt.getTime()) / msPerDay));

    // Create the logo
    const logoNode = this.workers.createWorkerLogoNode(worker);

    imgEl.src = workItem.imageUrl;
    logoEl.appendChild(logoNode);
    titleEl.innerHTML = workItem.name;
    linkEl.href = this.workRequestDetailsUrl.replace('#', workRequest._id);
    priceEl.innerHTML = `$${isNaN(workRequest.price) ? workItem.price.toLocaleString() : workRequest.price.toLocaleString()}`;
    instructionsEl.innerHTML = workRequest.instructions ? workRequest.instructions : '<small class="text-muted"><i>No special instructions</i></small>';
    timestampEl.innerHTML = daysAgo === 1 ? '1 day ago' : `${daysAgo} days ago`;
    itemEl.title = `Created: ${new Date(workRequest.createdAt).toLocaleString()}\nUpdated: ${new Date(workRequest.updatedAt).toLocaleString()}`;

    return statusNode;
  }

  async fetchWorkRequests(overrideCache = false) {
    // Make sure there is a user
    if (!this.profile.user) return this.items;

    // Check for cache
    if (this.item && this.items.length && !overrideCache) return this.items;

    // Determine which "view" of work the user should see
    let url = this.url;

    if (this.profile.isRequester) {
      url = `${url}/requester/${this.profile.user.id}`;
    }

    if (this.profile.isWorker) {
      url = `${url}/worker/${this.profile.user.id}`;
    }

    // Don't let them get anything if they don't have either of the roles
    if (url === this.url) return this.items;

    const headers = await KakyApiHeaders.setAuthorizationHeader();
    const response = await fetch(url, {
      method: 'GET',
      headers: headers
    });

    if (!response.ok) {
      this.items = [];
      throw new Error(`HTTP error fetching work requests! status: ${response.status}`);
    } else {
      const responseItems = await response.json();

      this.items = [];

      for(let item of responseItems.data) {
        this.items.push(new WorkRequest(item));
      }

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

  async handleStatusUpdate(event, workRequest) {
    const buttonEl = event.target;

    try {
      buttonEl.disabled = true;
      const headers = await KakyApiHeaders.setPOSTHeaders();
      const response = await fetch(`${this.url}/${workRequest._id}`, {
        method: 'PATCH',
        headers: headers,
        body: JSON.stringify(workRequest)
      });

      const responseData = await response.json();

      if (!responseData.data._id) {
        throw new Error('The work request status update attempt failed.');
      }

      window.location.reload();
    } catch (e) {
      console.error(`There was an error updating the work request status. \n${e}`);
    } finally {
      buttonEl.disabled = false;
    }
  }

  async handleSubmit(event, workRequest) {
    const formEl = event.target;
    const fieldsetEl = formEl.querySelector('fieldset');

    event.preventDefault();

    if (!workRequest) {
      throw new Error(`There is no work request, so nothing is going to happen.`);
    }

    if (formEl.checkValidity() === false) {
      event.stopPropagation();
      formEl.classList.add('was-validated');
      return;
    }

    fieldsetEl.disabled = true;

    return await this.add(workRequest);
  }

  renderActions(targetEl, workRequest) {
    // If there are no roles, nothing for them to do
    if (!this.profile.user) return;

    let primaryBtn = document.createElement('button');
    primaryBtn.classList.add('btn', 'btn-primary', 'btn-lg');
    primaryBtn.type = 'button';

    let secondaryBtn = document.createElement('button');
    secondaryBtn.classList.add('btn', 'btn-light', 'btn-lg', 'mr-3');
    secondaryBtn.type = 'button';

    let statusTxtEl = document.createElement('div');
    statusTxtEl.classList.add('text-muted');

    if (this.profile.isRequester) {
      switch (workRequest.status) {
        case 'open':
          primaryBtn.innerHTML = 'Cancel Request';
          primaryBtn.addEventListener('click', (e) => {
            workRequest.status = 'cancelled';
            this.handleStatusUpdate(e, workRequest);
          });

          targetEl.appendChild(primaryBtn);
          break;

        case 'cancelled':
          statusTxtEl.innerHTML = 'This work request has been cancelled.';
          targetEl.appendChild(statusTxtEl);
          break;

        case 'closed':
          statusTxtEl.innerHTML = 'This work request has been closed.';
          targetEl.appendChild(statusTxtEl);
          break;

        case 'paid':
          statusTxtEl.innerHTML = 'This work request has been marked as paid. Check with them to close it.';
          targetEl.appendChild(statusTxtEl);
          break;

        case 'rejected':
          statusTxtEl.innerHTML = 'This work request has been rejected. Create a new work request if you want to try again.';
          targetEl.appendChild(statusTxtEl);
          break;

        case 'waiting_for_payment':
          primaryBtn.innerHTML = 'Paid';
          primaryBtn.addEventListener('click', (e) => {
            workRequest.status = 'paid';
            this.handleStatusUpdate(e, workRequest);
          });
          targetEl.appendChild(primaryBtn);
          break;

        case 'working':
          statusTxtEl.innerHTML = 'This work request is currently being worked on (so they say).';
          targetEl.appendChild(statusTxtEl);
          break;

        default:
          break;
      }

      return;
    }

    if (this.profile.isWorker) {
      switch (workRequest.status) {
        case 'open':
          primaryBtn.innerHTML = 'Take It';
          primaryBtn.addEventListener('click', (e) => {
            workRequest.status = 'working';
            this.handleStatusUpdate(e, workRequest);
          });

          secondaryBtn.innerHTML = 'Leave It';
          secondaryBtn.addEventListener('click', (e) => {
            workRequest.status = 'rejected';
            this.handleStatusUpdate(e, workRequest);
          });

          targetEl.appendChild(secondaryBtn);
          targetEl.appendChild(primaryBtn);
          break;

        case 'cancelled':
          statusTxtEl.innerHTML = 'This work request has been cancelled.';
          targetEl.appendChild(statusTxtEl);
          break;

        case 'closed':
          statusTxtEl.innerHTML = 'This work request has been closed.';
          targetEl.appendChild(statusTxtEl);
          break;

        case 'paid':
          primaryBtn.innerHTML = 'All Done';
          primaryBtn.addEventListener('click', (e) => {
            workRequest.status = 'closed';
            this.handleStatusUpdate(e, workRequest);
          });
          targetEl.appendChild(primaryBtn);
          break;

        case 'rejected':
          statusTxtEl.innerHTML = 'This work request has been rejected.';
          targetEl.appendChild(statusTxtEl);
          break;

        case 'waiting_for_payment':
          statusTxtEl.innerHTML = 'This work request is still waiting for payment. Get them to pay you!';
          targetEl.appendChild(statusTxtEl);
          break;

        case 'working':
          primaryBtn.innerHTML = 'Get Paid';
          primaryBtn.addEventListener('click', (e) => {
            workRequest.status = 'waiting_for_payment';
            this.handleStatusUpdate(e, workRequest);
          });
          targetEl.appendChild(primaryBtn);
          break;

        default:
          break;
      }

      return;
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
      if (e.target.value && e.target.value.length > 200) {
        inputBox.classList.remove('is-valid');
        inputBox.classList.add('is-invalid');
      } else {
        inputBox.classList.remove('is-invalid');
        workRequest.instructions = e.target.value;
      }
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
      if (isNaN(e.target.value) || Math.floor(e.target.value) < 1 || Math.floor(e.target.value) > 100) {
        inputBox.classList.remove('is-valid');
        inputBox.classList.add('is-invalid');
      } else {
        inputBox.classList.remove('is-invalid');
        e.target.value = Math.floor(e.target.value);
        workRequest.price = e.target.value;
      }
    });

    targetEl.appendChild(el);
  }

  validateWorkRequest(user, workRequest) {
    if (!workRequest) {
      throw new Error(`There was a problem. You're going to have to talk to them yourself.`);
    }

    if (!user) {
      throw new Error(`This isn't going to work. You haven't logged in yet.`);
    } else {
      if (!user.app_metadata || !user.app_metadata.roles.find(r => r === 'AssignWork')) {
        throw new Error(`This isn't going to work. Your profile doesn't allow you to assign work.`);
      }
    }

    // Check the work request object
    if (!workRequest.isValid()) {
      throw new Error(`This isn't going to work. Things are missing from the work request.`);
    }
  }
}

export { WorkRequests };
