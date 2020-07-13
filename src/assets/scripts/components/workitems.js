class WorkItems {
  constructor(itemLimitPerRow) {
    this.itemLimit = itemLimitPerRow || 3;
    this.workItems = [];
    this.workItemsUrl = './assets/data/workitems.json';
    this.assignWorkUrl = './assign.html';
    this.workItemTemplate = `
    <li class="list-group-item list-group-item-action">
      <div class="media position-relative">
        <div class="img-parent mr-3">
          <img class="img-fluid img-thumbnail" />
        </div>
        <div class="media-body">
          <div class="d-flex justify-content-between">
            <h1 class="mb-1"></h1>
            <h3><a href="#" class="stretched-link"></a></h3>
          </div>
          <ul class="mb-1"></ul>
        </div>
      </div>

    </li>
    `;
    this.workItemPriceEditorTemplate = `
    <h5 class="card-title">Set a price for <i></i></h5>
    <p class="card-text">Use the defult price or negotiate a new one.</p>
    <div class="input-group mb-3">
      <div class="input-group-prepend">
        <span class="input-group-text">$</span>
      </div>
      <input type="number" min="0" class="form-control" aria-label="Negotiated Amount" />
    </div>
    `;
  }

  createWorkItemNode(item, template, allowAssignment = true) {
    const listItem = template.content.cloneNode(true);

    const imgEl = listItem.querySelector('img');
    imgEl.src = item.imageUrl;

    const titleEl = listItem.querySelector('h1');
    titleEl.innerHTML = item.name;

    let priceEl;

    if (allowAssignment) {
      priceEl = listItem.querySelector('h3 a');
      priceEl.href = `${this.assignWorkUrl}?id=${item.id}`;
    } else {
      priceEl = priceEl = listItem.querySelector('h3');
    }

    priceEl.innerHTML = `&#36;${item.price}`;

    const tasksEl = listItem.querySelector('ul');

    item.tasks.forEach(task => {
      const li = document.createElement('li');
      li.innerHTML = `${task}`;
      tasksEl.appendChild(li);
    });

    return listItem;
  }

  async fetchWorkItems(overrideCache = false) {
    if (this.workItems && this.workItems.length && !overrideCache) return this.workItems;

    let response = await fetch(this.workItemsUrl);

    if (!response.ok) {
      throw new Error(`HTTP error fetching work items! status: ${response.status}`);
    } else {
      this.workItems = await response.json();
      return this.workItems;
    }
  }

  async findWorkItem(id) {
    let workItems = await this.fetchWorkItems();

    return workItems.find(x => x.id === id);
  }

  async renderList(targetEl) {
    if (!targetEl || !targetEl.innerHTML) throw new Error('There is no target element to add work items into.');

    const template = document.createElement('template');
    template.innerHTML = this.workItemTemplate;
    let workItems = await this.fetchWorkItems();

    workItems.forEach(item => {
      let card = this.createWorkItemNode(item, template);
      targetEl.appendChild(card);
    });
  }

  async renderPriceEditor(targetEl, id) {
    if (!targetEl || !targetEl.innerHTML) throw new Error('There is no target element to the add work item price editor into.');

    let workItem = await this.findWorkItem(id);

    if (!workItem) throw new Error('The work item does not exist. Cannot render price editor.');

    const template = document.createElement('template');
    template.innerHTML = this.workItemPriceEditorTemplate;

    const editor = template.content.cloneNode(true);

    const inputBox = editor.querySelector('input');
    inputBox.value = `${isNaN(workItem.price) ? 1 : workItem.price}`;

    const itemDesc = editor.querySelector('i');
    itemDesc.innerHTML = `${workItem.name}`;

    targetEl.appendChild(editor);
  }

  async renderWorkItem(targetEl, id, allowAssignment = true) {
    if (!targetEl || !targetEl.innerHTML) throw new Error('There is no target element to the add work item to.');

    const template = document.createElement('template');
    template.innerHTML = this.workItemTemplate;

    let workItem = await this.findWorkItem(id);

    if (!workItem) throw new Error('The work item does not exist.');

    let workItemNode = this.createWorkItemNode(workItem, template, allowAssignment);

    targetEl.appendChild(workItemNode);
  }
}
