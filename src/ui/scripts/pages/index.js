import { WorkItems } from '../components/work-items';

export async function indexPage() {
  const workItems = new WorkItems();
  workItems.renderList(document.getElementById('workitems'));
};
