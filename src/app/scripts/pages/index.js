import { WorkItems } from '../components/workitems';

export async function indexPage() {
  const workItems = new WorkItems();
  workItems.renderList(document.getElementById('workitems'));
};
