class WorkItems {
  constructor(itemLimitPerRow) {
    this.itemLimit = itemLimitPerRow || 3;
    this.workItemsUrl = './assets/data/workitems.json';
    this.assignWorkUrl = './assign.html'
    this.template = `
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
  }

  render(targetEl) {
    if (!targetEl || !targetEl.innerHTML) throw new Error('There is no target element to add work items.');

    fetch(this.workItemsUrl)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        this.createWorkItems(targetEl, data);
      });
  }

  createWorkItems(targetEl, items) {
    const template = document.createElement('template');
    template.innerHTML = this.template;
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
