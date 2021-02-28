import { KakyApiHeaders } from './api';

class WorkItems {
  constructor(itemLimitPerRow) {
    this.itemLimit = itemLimitPerRow || 3;
    this.workItems = [];
    this.workItemsUrl = '/.netlify/functions/work-items';
    this.assignWorkUrl = '/work-requests/assign.html';
    this.workItemTemplate = `
      <div class="row work-item">
        <div class="col-sm-4">
          <div class="img-parent">
            <img class="img-fluid img-thumbnail" />
          </div>
        </div>
        <div class="col-sm-8">
          <div class="flex-column align-items-start mb-1">
            <div class="d-flex w-100 justify-content-between">
              <h1 class="mb-1"></h5>
              <a href="#" class="stretched-link">
                <h3></h3>
              </a>
            </div>
          </div>
          <ul class="mb-1"></ul>
        </div>
      </div>
    `;
  }

  createWorkItemNode(item, template, allowAssignment = false) {
    const listItem = template.content.cloneNode(true);

    const imgEl = listItem.querySelector('img');
    imgEl.src = item.imageUrl;
    imgEl.alt = item.name;
    imgEl.title = item.name;

    const titleEl = listItem.querySelector('h1');
    titleEl.innerHTML = item.name;

    const priceEl = listItem.querySelector('h3');
    priceEl.innerHTML = `&#36;${item.price}`;

    const linkEl = listItem.querySelector('a');

    if (allowAssignment) {
      linkEl.href = `${this.assignWorkUrl}?id=${item.id}`;
    } else {
      linkEl.remove();
    }

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

    const headers = await KakyApiHeaders.setAuthorizationHeader(new Headers());
    const response = await fetch(this.workItemsUrl, {
      headers: headers
    });

    if (!response.ok) {
      throw new Error(`HTTP error fetching work items! status: ${response.status}`);
    } else {
      const items = await response.json();
      this.workItems = items.data;
      return this.workItems;
    }
  }

  async findWorkItemById(id) {
    const workItems = await this.fetchWorkItems();

    return workItems.find(x => x.id == id); // let it be a loose match
  }

  async renderList(targetEl) {
    if (!targetEl || targetEl.innerHTML === undefined) throw new Error('There is no target element to add work items into.');

    const template = document.createElement('template');
    template.innerHTML = this.workItemTemplate;
    const workItems = await this.fetchWorkItems();

    workItems.forEach(workItem => {
      let li = document.createElement('li');
      li.classList.add('list-group-item', 'list-group-item-action');
      const workItemEl = this.createWorkItemNode(workItem, template, true);
      li.appendChild(workItemEl);
      targetEl.appendChild(li);
    });
  }

  async renderWorkItem(targetEl, workItem, allowAssignment = false) {
    if (!targetEl || targetEl.innerHTML === undefined) throw new Error('There is no target element to render the work item into.');
    if (!workItem) throw new Error('The work item does not exist.');

    const template = document.createElement('template');
    template.innerHTML = this.workItemTemplate;

    const workItemNode = this.createWorkItemNode(workItem, template, allowAssignment);

    targetEl.appendChild(workItemNode);
  }

  async renderWorkItemById(targetEl, id, allowAssignment = false) {
    if (!targetEl || targetEl.innerHTML === undefined) throw new Error('There is no target element to render the work item into.');
    if (!id) throw new Error('No work item ID.');

    const workItem = await this.findWorkItemById(id);

    this.renderWorkItem(targetEl, workItem, allowAssignment);
  }
}

export { WorkItems };
