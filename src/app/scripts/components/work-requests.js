class WorkRequests {
  constructor() {
    this.items = [];
    this.defaultPrice = 1;
    this.url = '/.netlify/functions/workrequest-read-all';
    this.emptyInstructionsMessage = 'You got lucky ... no special instructions this time.';
    this.workRequestInstructionsTemplate = `
    <textarea class="form-control" aria-label="Special instructions" maxlength="200"></textarea>
    `;
    this.workRequestPriceTemplate = `
    <div class="input-group mb-3">
      <div class="input-group-prepend">
        <span class="input-group-text">$</span>
      </div>
      <input type="number" min="0" class="form-control" aria-label="Negotiated Amount" />
    </div>
    `;
  }

  async fetchWorkRequests(overrideCache = false) {
    if (this.item && this.items.length && !overrideCache) return this.items;

    const response = await fetch(this.url);

    if (!response.ok) {
      this.items = [];
      throw new Error(`HTTP error fetching work requests! status: ${response.status}`);
    } else {
      const items = await response.json();
      this.items = items.default;
      return this.items;
    }
  }

  async findWorkRequestById(id) {
    let workRequests = await this.fetchWorkRequests();

    return workRequests.find(x => x.id == id); // let it be a loose match
  }

  renderInstructions(targetEl, workRequest, editable = false, showEmptyInstructionsMessage = true) {
    if (!targetEl || !targetEl.innerHTML) throw new Error('There is no target element to render the work request instructions into.');
    if (!workRequest) throw new Error('There is no work request!');

    const template = document.createElement('template');
    template.innerHTML = this.workRequestInstructionsTemplate;

    const el = template.content.cloneNode(true);
    const input = el.querySelector('textarea');

    if (workRequest.instructions) {
      input.value = workRequest.instructions;
    } else {
      input.value = showEmptyInstructionsMessage ? this.emptyInstructionsMessage : '';
    }

    input.disabled = !editable;

    targetEl.appendChild(el);
  }

  renderPrice(targetEl, workRequest, editable = false) {
    if (!targetEl || !targetEl.innerHTML) throw new Error('There is no target element to render the work request price into.');
    if (!workRequest) throw new Error('There is no work request!');

    const template = document.createElement('template');
    template.innerHTML = this.workRequestPriceTemplate;

    const el = template.content.cloneNode(true);
    const inputBox = el.querySelector('input');
    inputBox.value = `${isNaN(workRequest.price) ? this.defaultPrice : workRequest.price}`;
    inputBox.disabled = !editable;

    targetEl.appendChild(el);
  }
}

export { WorkRequests };
