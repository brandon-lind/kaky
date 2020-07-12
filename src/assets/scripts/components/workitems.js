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
    <div class="input-group mb-3">
      <div class="input-group-prepend">
        <span class="input-group-text">$</span>
      </div>
      <input type="text" class="form-control" aria-label="Negotiated Amount (to the nearest dollar)" />
    </div>
    `;
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

  async renderAll(targetEl) {
    if (!targetEl || !targetEl.innerHTML) throw new Error('There is no target element to add work items into.');

    let workItems = await this.fetchWorkItems();

    this.renderWorkItems(targetEl, workItems);
  }

  async renderPriceEditor(targetEl, id) {
    if (!targetEl || !targetEl.innerHTML) throw new Error('There is no target element to the add work item price editor into.');

    let workItem = await this.findWorkItem(id);

    if (!workItem) throw new Error('The work item does not exist. Cannot render price editor.');

    const template = document.createElement('template');
    template.innerHTML = this.workItemPriceEditorTemplate;

    const editor = template.content.cloneNode(true);

    const inputBox = editor.querySelector('input');
    inputBox.value = `${workItem.price}`;

    targetEl.appendChild(editor);
  }

  async renderWorkItem(targetEl, id) {
    if (!targetEl || !targetEl.innerHTML) throw new Error('There is no target element to the add work item to.');

    let workItem = await this.findWorkItem(id);

    if (!workItem) throw new Error('The work item does not exist.');

    this.renderWorkItems(targetEl, new Array(workItem));
  }

  renderWorkItems(targetEl, items) {
    if (!targetEl || !targetEl.innerHTML) throw new Error('There is no target element to add work items into.');

    const template = document.createElement('template');
    template.innerHTML = this.workItemTemplate;
    let counter = 0;
    let cardDeck;

    items.forEach(item => {
      const card = template.content.cloneNode(true);

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

      const a = card.querySelector('a');
      a.href = `${this.assignWorkUrl}?id=${item.id}`;

      const img = card.querySelector('img');
      img.src = item.imageUrl;
      img.onclick = () => { window.location = `${this.assignWorkUrl}?id=${item.id}`;};

      const title = card.querySelector('h1');
      title.innerHTML = item.name;

      const price = card.querySelector('h2');
      price.innerHTML = `&#36;${item.price}`;

      const tasks = card.querySelector('ul');

      item.tasks.forEach(task => {
        const li = document.createElement('li');
        li.innerHTML = task;
        tasks.appendChild(li);
      });

      cardDeck.appendChild(card);
    });
  }
}
