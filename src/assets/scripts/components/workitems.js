class WorkItems {
  constructor(itemLimitPerRow) {
    this.itemLimit = itemLimitPerRow || 3;
    this.workItems = [];
    this.workItemsUrl = './assets/data/workitems.json';
    this.assignWorkUrl = './assign.html'
    this.workItemTemplate = `
    <div class="card mb-4 shadow-sm">
      <img class="img-fluid card-img-top" />
      <div class="card-body d-flex flex-column">
        <h1 class="card-title pricing-card-title"></h1>
        <h2 class="mb-1 text-muted"></h2>
        <ul class="text-left mt-3 mb-4"></ul>
      </div>
      <div class="card-footer">
        <a class="btn btn-lg btn-block btn-primary mt-auto">Assign</a>
      </div>
    </div>`;
    this.workItemPriceEditorTemplate = `
    <h5 class="card-title">Set a price for <i></i></h5>
    <p class="card-text">Use the defult price or negotiate a new one.</p>
    <div class="input-group mb-3">
      <div class="input-group-prepend">
        <span class="input-group-text">$</span>
      </div>
      <input type="text" class="form-control" aria-label="Negotiated Amount" />
    </div>
    `;
  }

  createWorkItemNode(item, template, allowAssignment = true) {
    const listItem = template.content.cloneNode(true);

    const img = listItem.querySelector('img');
    img.src = item.imageUrl;

    if (allowAssignment) {
      img.onclick = () => { window.location = `${this.assignWorkUrl}?id=${item.id}`;};
      img.style.cursor = 'pointer';
    }

    const title = listItem.querySelector('h1');
    title.innerHTML = item.name;

    const price = listItem.querySelector('h2');
    price.innerHTML = `&#36;${item.price}`;

    const tasks = listItem.querySelector('ul');

    item.tasks.forEach(task => {
      const li = document.createElement('li');
      li.innerHTML = task;
      tasks.appendChild(li);
    });

    const assignButton = listItem.querySelector('a.btn');

    if (allowAssignment) {
      assignButton.href = `${this.assignWorkUrl}?id=${item.id}`;
    } else {
      assignButton.remove();
    }

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
    let counter = 0;
    let cardDeck;
    let workItems = await this.fetchWorkItems();

    workItems.forEach(item => {
      if (counter === 0) {
        cardDeck = document.createElement('div');
        cardDeck.classList.add('card-deck', 'mb-3', 'text-center');
        targetEl.appendChild(cardDeck);
      }

      if (counter === (this.itemLimit - 1)) {
        counter = 0;
      } else {
        counter++;
      }

      let card = this.createWorkItemNode(item, template);
      cardDeck.appendChild(card);
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
