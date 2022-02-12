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
    this.workRequestStatusTemplate = `<div class="workrequest-status list-group-item list-group-item-action flex-column align-items-start p-3">
    <div class="workrequest-preview">
      <div class="worker-logo position-absolute top-5 start-0 ms-1"></div>
      <div class="d-flex w-100 mb-1">
        <div class="img-parent me-3">
          <img class="img-fluid img-thumbnail" />
        </div>
        <div class="align-items-center">
          <a href="#" class="stretched-link">
            <h5 class="mb-0"></h5>
          </a>
          <strong class="text-muted"></strong>
          <br />
          <small class="workrequest-days text-muted"></small>
        </div>
      </div>
      <p class="alert alert-info" role="alert"></p>
    </div>

    <div class="workrequest-actions d-none">
      <div class="mb-3 text-end">
        <button type="button" class="btn-close" aria-label="Close"></button>
      </div>
      <div class="row justify-content-center mb-3">
        <div class="col-md-8 col-lg-6">
          <div class="alert alert-danger mb-1 d-none"></div>
          <div class="action-buttons d-grid gap-2">
            <a href="#" class="btn btn-secondary">View Details</a>
            <button type="button" class="workrequest-reorder btn btn-secondary d-none">Reorder</button>
          </div>
        </div>
      </div>
    </div>

    <div class="workrequest-id text-right"><small class="text-muted"></small></div>
    <div class="workrequest-timestamps"><small class="text-muted"></small></div>
  </div>`;
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

    const idEl = statusNode.querySelector('div.workrequest-id>small');
    const itemEl = statusNode.querySelector('div.workrequest-status');
    const imgEl = statusNode.querySelector('img');
    const instructionsEl = statusNode.querySelector('.alert-info');
    const linkEl = statusNode.querySelector('a.stretched-link');
    const logoEl = statusNode.querySelector('.worker-logo');
    const priceEl = statusNode.querySelector('strong.text-muted');
    const daysCounterEl = statusNode.querySelector('small.workrequest-days');
    const timestampsEl = statusNode.querySelector('div.workrequest-timestamps>small')
    const titleEl = statusNode.querySelector('h5');
    const previewEl = statusNode.querySelector('.workrequest-preview');
    const actionsEl = statusNode.querySelector('.workrequest-actions');
    const actionsErrorEl = statusNode.querySelector('.workrequest-actions .alert-danger');
    const actionButtonsEl = statusNode.querySelector('.workrequest-actions .action-buttons');
    const actionsCloseEl = statusNode.querySelector('.workrequest-actions .btn-close');
    const reorderBtnEl = statusNode.querySelector('.workrequest-actions button.workrequest-reorder');
    const viewDetailsLinkEl = statusNode.querySelector('.workrequest-actions a');

    // Calculate how many days ago the request was submitted
    const today = new Date();
    const createdAt = new Date(workRequest.createdAt);
    const msPerDay = (1000*60*60*24);
    const daysAgo = Math.floor(Math.abs((today.getTime() - createdAt.getTime()) / msPerDay));

    // Create the worker logo
    const logoNode = this.workers.createWorkerLogoNode(worker);

    idEl.textContent = `ID: ${workRequest._id.substring(workRequest._id.length - 5).toUpperCase()}`;
    imgEl.src = workItem.imageUrl;
    imgEl.alt = workItem.name;
    imgEl.title = workItem.name;
    logoEl.appendChild(logoNode);
    titleEl.textContent = workItem.name;
    linkEl.href = this.workRequestDetailsUrl.replace('#', workRequest._id);
    priceEl.textContent = `$${isNaN(workRequest.price) ? workItem.price.toLocaleString() : workRequest.price.toLocaleString()}`;
    instructionsEl.textContent = workRequest.instructions ? workRequest.instructions : '<small class="text-muted"><i>No special instructions</i></small>';
    daysCounterEl.textContent = daysAgo === 1 ? '1 day ago' : `${daysAgo} days ago`;
    viewDetailsLinkEl.href = this.workRequestDetailsUrl.replace('#', workRequest._id);
    timestampsEl.innerHTML = `Created: ${new Date(workRequest.createdAt).toLocaleString()}<br />Updated: ${new Date(workRequest.updatedAt).toLocaleString()}`;

    // Determine if the user can reorder
    if (this.profile.isRequester) {
      reorderBtnEl.classList.remove('d-none');
      reorderBtnEl.addEventListener('click', async (evt) => {
        evt.preventDefault();

        try {
          actionsEl.querySelectorAll('button').disabled = true;
          actionsErrorEl.classList.add('d-none');
          const clonedWorkRequest = this.cloneWorkRequestForReorder(workRequest);
          await this.add(clonedWorkRequest);
          window.location.reload();
        } catch (err) {
          console.error(err.message);
          actionsErrorEl.textContent = 'The work request could not be reordered.';
          actionsErrorEl.classList.remove('d-none');
        } finally {
          actionsEl.querySelectorAll('button').disabled = false;
        }
      });
    }

    // Create the rest of the action buttons
    this.renderActions(actionButtonsEl, actionsErrorEl, workRequest);

    // Create the work request menu
    linkEl.addEventListener('click', (evt) => {
      evt.preventDefault();
      previewEl.classList.add('d-none');
      actionsEl.classList.remove('d-none');
    });

    actionsCloseEl.addEventListener('click', (evt) => {
      evt.preventDefault();
      actionsEl.classList.add('d-none');
      previewEl.classList.remove('d-none');
    });

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

      window.location.href = 'list.html';
    } catch (e) {
      console.error(`There was an error updating the work request status. \n${e}`);
      throw new Error('There was an error updating the work request.');
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
      throw new Error(`You make me sad that you can't read directions. Go check for errors above.`);
    }

    fieldsetEl.disabled = true;

    return await this.add(workRequest);
  }

  async renderActions(targetEl, errorMessageEl, workRequest) {
    // If there are no roles, nothing for them to do
    if (!this.profile.user) return;

    let primaryBtn = document.createElement('button');
    primaryBtn.classList.add('btn', 'btn-primary');
    primaryBtn.type = 'button';

    let secondaryBtn = document.createElement('button');
    secondaryBtn.classList.add('btn', 'btn-secondary');
    secondaryBtn.type = 'button';

    let statusTxtEl = document.createElement('div');
    statusTxtEl.classList.add('text-muted');

    function showErrorMessage(err) {
      errorMessageEl.classList.remove('d-none');
      console.error(err.message);
      errorMessageEl.textContent = 'There was an error when trying to update the status.';
    }

    if (this.profile.isRequester) {
      switch (workRequest.status) {
        case 'open':
          primaryBtn.textContent = 'Cancel Request';
          primaryBtn.addEventListener('click', async (evt) => {
            try {
              evt.target.disabled = true;
              workRequest.status = 'cancelled';
              await this.handleStatusUpdate(evt, workRequest);
            } catch (err) {
              showErrorMessage(err);
            } finally {
              evt.target.disabled = false;
            }
          });

          targetEl.appendChild(primaryBtn);
          break;

        case 'cancelled':
          statusTxtEl.innerHTML = '<div class="alert alert-info" role="alert">This work request has been cancelled.</div>';
          targetEl.appendChild(statusTxtEl);
          break;

        case 'closed':
          statusTxtEl.innerHTML = '<div class="alert alert-info" role="alert">This work request has been closed.</div>';
          targetEl.appendChild(statusTxtEl);
          break;

        case 'paid':
          statusTxtEl.innerHTML = '<div class="alert alert-info" role="alert">This work request has been marked as paid. Check with them to close it.</div>';
          targetEl.appendChild(statusTxtEl);
          break;

        case 'rejected':
          statusTxtEl.innerHTML = '<div class="alert alert-info" role="alert">This work request has been rejected. Create a new work request if you want to try again.</div>';
          targetEl.appendChild(statusTxtEl);
          break;

        case 'waiting_for_payment':
          primaryBtn.textContent = 'Paid';
          primaryBtn.addEventListener('click', async (evt) => {
            try {
              evt.target.disabled = true;
              workRequest.status = 'paid';
              await this.handleStatusUpdate(evt, workRequest);
            } catch (err) {
              showErrorMessage(err);
            } finally {
              evt.target.disabled = false;
            }
          });

          targetEl.appendChild(primaryBtn);
          break;

        case 'working':
          statusTxtEl.innerHTML = '<div class="alert alert-info" role="alert">This work request is currently being worked on (so they say).</div>';
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
          primaryBtn.textContent = 'Take It';
          primaryBtn.addEventListener('click', async (evt) => {
            try {
              evt.target.disabled = true;
              workRequest.status = 'working';
              await this.handleStatusUpdate(evt, workRequest);
            } catch (err) {
              showErrorMessage(err);
            } finally {
              evt.target.disabled = false;
            }
          });

          secondaryBtn.textContent = 'Leave It';
          secondaryBtn.addEventListener('click', async (evt) => {
            try {
              evt.target.disabled = true;
              workRequest.status = 'rejected';
              await this.handleStatusUpdate(evt, workRequest);
            } catch (err) {
              showErrorMessage(err);
            } finally {
              evt.target.disabled = false;
            }
          });

          targetEl.appendChild(secondaryBtn);
          targetEl.appendChild(primaryBtn);
          break;

        case 'cancelled':
          statusTxtEl.innerHTML = '<div class="alert alert-info" role="alert">This work request has been cancelled.</div>';
          targetEl.appendChild(statusTxtEl);
          break;

        case 'closed':
          statusTxtEl.innerHTML = '<div class="alert alert-info" role="alert">This work request has been closed.</div>';
          targetEl.appendChild(statusTxtEl);
          break;

        case 'paid':
          primaryBtn.textContent = 'All Done';
          primaryBtn.addEventListener('click', async (evt) => {
            try {
              evt.target.disabled = true;
              workRequest.status = 'closed';
              await this.handleStatusUpdate(evt, workRequest);
            } catch (err) {
              showErrorMessage(err);
            } finally {
              evt.target.disabled = false;
            }
          });

          targetEl.appendChild(primaryBtn);
          break;

        case 'rejected':
          statusTxtEl.innerHTML = '<div class="alert alert-info" role="alert">This work request has been rejected.</div>';
          targetEl.appendChild(statusTxtEl);
          break;

        case 'waiting_for_payment':
          statusTxtEl.innerHTML = '<div class="alert alert-info" role="alert">This work request is still waiting for payment. Get them to pay you!</div>';
          targetEl.appendChild(statusTxtEl);
          break;

        case 'working':
          primaryBtn.textContent = 'Get Paid';
          primaryBtn.addEventListener('click', async (evt) => {
            try {
              evt.target.disabled = true;
              workRequest.status = 'waiting_for_payment';
              await this.handleStatusUpdate(evt, workRequest);
            } catch (err) {
              showErrorMessage(err);
            } finally {
              evt.target.disabled = false;
            }
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
