class WorkItems {
  constructor(itemLimitPerRow) {
    this.itemLimit = itemLimitPerRow || 3;
    this.workItems = [];
    this.workItemsUrl = '/.netlify/functions/work-items';
    this.assignWorkUrl = './assign.html';
    this.workItemTemplate = `
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
      const items = await response.json();
      this.workItems = items.default;
      return this.workItems;
    }
  }

  async findWorkItemById(id) {
    let workItems = await this.fetchWorkItems();

    return workItems.find(x => x.id == id); // let it be a loose match
  }

  async renderList(targetEl) {
    if (!targetEl || !targetEl.innerHTML) throw new Error('There is no target element to add work items into.');

    const template = document.createElement('template');
    template.innerHTML = this.workItemTemplate;
    const workItems = await this.fetchWorkItems();

    workItems.forEach(workItem => {
      let li = document.createElement('li');
      li.classList.add('list-group-item', 'list-group-item-action');
      const workItemEl = this.createWorkItemNode(workItem, template);
      li.appendChild(workItemEl);
      targetEl.appendChild(li);
    });
  }

  async renderWorkItem(targetEl, workItem, allowAssignment = true) {
    if (!targetEl || !targetEl.innerHTML) throw new Error('There is no target element to render the work item into.');
    if (!workItem) throw new Error('The work item does not exist.');

    const template = document.createElement('template');
    template.innerHTML = this.workItemTemplate;

    const workItemNode = this.createWorkItemNode(workItem, template, allowAssignment);

    targetEl.appendChild(workItemNode);
  }

  async renderWorkItemById(targetEl, id, allowAssignment = true) {
    if (!targetEl || !targetEl.innerHTML) throw new Error('There is no target element to render the work item into.');
    if (!id) throw new Error('No work item ID.');

    const workItem = await this.findWorkItemById(id);

    this.renderWorkItem(targetEl, workItem, allowAssignment);
  }
}

export { WorkItems };
