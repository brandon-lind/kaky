import { WorkItems } from '../../components/work-items';

export async function workRequestIndexPage() {
  const workItems = new WorkItems();
  const targetEl = document.querySelector('#workitems');
  workItems.renderList(targetEl);
};
