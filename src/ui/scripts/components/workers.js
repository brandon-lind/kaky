import { KakyApiHeaders } from './api';

class Workers {
  constructor() {
    this.workers = [];
    this.workersUrl = '/.netlify/functions/workers';
    this.workerLogoTemplate = `
    <svg class="bd-placeholder-img rounded-circle" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" focusable="false" role="img" aria-label="Worker">
      <title></title>
      <rect width="100%" height="100%"></rect>
      <text x="50%" y="50%" dy="0.35em"></text>
    </svg>
    `;
    this.workerItemTemplate = `
    <div class="media">
      <div class="media-body">
        <h5 class="mt-0"></h5>
        <p></p>
      </div>
    </div>
    `;
  }

  createWorkerNode(worker, template) {
    if (!template) {
      template = document.createElement('template');
      template.innerHTML = this.workerItemTemplate;
    }

    const node = template.content.cloneNode(true);
    const logoNode = this.createWorkerLogoNode(worker);

    const media = node.querySelector('.media');
    media.prepend(logoNode);
    media.querySelector('svg').classList.add('mr-3');

    const name = node.querySelector('h5');
    name.innerHTML = worker.name;

    const tagline = node.querySelector('div.media-body p');
    tagline.innerHTML = worker.tagline;

    return node;
  }

  createWorkerLogoNode(worker, template) {
    if (!template) {
      template = document.createElement('template');
      template.innerHTML = this.workerLogoTemplate;
    }

    const node = template.content.cloneNode(true);

    const iconTitle = node.querySelector('svg title');
    iconTitle.innerHTML = worker.name;

    const monogram = node.querySelector('svg text');
    monogram.innerHTML = worker.monogram;

    return node;
  }

  async fetchWorkers(overrideCache = false) {
    if (this.workers && this.workers.length && !overrideCache) return this.workers;

    const headers = await KakyApiHeaders.setAuthorizationHeader();
    let response = await fetch(this.workersUrl, {
      headers: headers
    });

    if (!response.ok) {
      throw new Error(`HTTP error fetching workers! status: ${response.status}`);
    } else {
      const items = await response.json();
      this.workers = items.data;
      return this.workers;
    }
  }

  async findWorkerById(id) {
    const workers = await this.fetchWorkers();

    return workers.find(x => x.id === id);
  }

  async renderList(targetEl, workRequest, isSelectable = false) {
    if (!targetEl || targetEl.innerHTML === undefined) throw new Error('There is no target element for rendering out the workers.');

    const workers = await this.fetchWorkers();
    const template = document.createElement('template');
    template.innerHTML = this.workerItemTemplate;

    workers.forEach(worker => {
      const li = document.createElement('li');
      li.classList.add('list-group-item', 'list-group-item-action');
      li.dataset.workerId = worker.id;

      if (isSelectable) {
        li.addEventListener('click', (evt) => {
          evt.preventDefault();

          // Bootstrap listgroup fixup
          targetEl.querySelectorAll('li.active')
                  .forEach(activeLi => {
                    activeLi.classList.remove('active');
                  });

          this.setSelectedItem(li, workRequest);
        });
      }

      if (workRequest && workRequest.workerId === worker.id) {
        li.classList.add('active');
      }

      const workerNode = this.createWorkerNode(worker, template);
      li.appendChild(workerNode);
      targetEl.appendChild(li);
    });

    // Select the first worker if selection is enabled and nothing is currently selected
    if (isSelectable) {
      if (!targetEl.querySelector('li.active')) {
        this.setSelectedItem(targetEl.querySelector('li:first-child'), workRequest);
      }
    }
  }

  async renderWorkerById(targetEl, id) {
    if (!targetEl || targetEl.innerHTML === undefined) throw new Error('There is no target element for rendering the worker.');

    const worker = await this.findWorkerById(id);

    if (!worker) throw new Error('Invalid worker. Cannot render the profile.');

    const template = document.createElement('template');
    template.innerHTML = this.workerItemTemplate;
    const workerNode = this.createWorkerNode(worker, template);
    targetEl.appendChild(workerNode);
  }

  setSelectedItem(item, workRequest) {
    if (item && item.dataset !== undefined) {
      item.classList.add('active');

      // Update the object with the selected worker
      if (workRequest) {
        workRequest.workerId = item.dataset.workerId;
      }
    }
  }
}

export { Workers };
