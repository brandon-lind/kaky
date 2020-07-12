class Workers {
  constructor() {
    this.workers = [];
    this.workersUrl = './assets/data/workers.json';
    this.workerItemTemplate = `
    <li class="list-group-item list-group-item-action">
      <div class="media">
        <svg class="bd-placeholder-img mr-3 rounded-circle" width="64" height="64" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" focusable="false" role="img" aria-label="Placeholder: 64x64">
          <title></title>
          <rect width="100%" height="100%" fill="#868e96"></rect>
          <text x="50%" y="50%" fill="#dee2e6" dy=".3em"></text>
        </svg>
        <div class="media-body">
          <h5 class="mt-0"></h5>
          <p></p>
        </div>
      </div>
    </li>
    `;
  }

  createWorkerNode(worker, template) {
    const listItem = template.content.cloneNode(true);

    const iconTitle = listItem.querySelector('svg title');
    iconTitle.innerHTML = worker.name;

    const monogram = listItem.querySelector('svg text');
    monogram.innerHTML = worker.monogram;

    const title = listItem.querySelector('h5');
    title.innerHTML = worker.name;

    const tagline = listItem.querySelector('div.media-body p');
    tagline.innerHTML = worker.tagline;

    return listItem;
  }

  async fetchWorkers(overrideCache = false) {
    if (this.workers && this.workers.length && !overrideCache) return this.workers;

    let response = await fetch(this.workersUrl);

    if (!response.ok) {
      throw new Error(`HTTP error fetching workers! status: ${response.status}`);
    } else {
      this.workers = await response.json();
      return this.workers;
    }
  }

  async findWorker(id) {
    let workers = await this.fetchWorkers();

    return workers.find(x => x.id === id);
  }

  async renderList(targetEl) {
    if (!targetEl || !targetEl.innerHTML) throw new Error('There is no target element for listing workers.');

    const template = document.createElement('template');
    template.innerHTML = this.workerItemTemplate;

    let workers = await this.fetchWorkers();

    workers.forEach(worker => {
      const workerNode = this.createWorkerNode(worker, template);

      targetEl.appendChild(workerNode);
    });

    // jQuery toggle shortcut to fix bootstrap
    $('li', targetEl).click(function(e) {
      e.preventDefault();
      let $that = $(this);
      $that.parent().find('li').removeClass('active');
      $that.addClass('active');
    });
  }
}
