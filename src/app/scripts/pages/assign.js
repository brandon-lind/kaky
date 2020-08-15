import { WorkRequest } from '../models/work-request';
import { WorkRequests } from '../components/work-requests';
import { WorkItems } from '../components/work-items';
import { Workers } from '../components/workers';

export async function assignPage() {
  const parsedUrl = new URL(window.location.href);
  const workItemId = parsedUrl.searchParams.get('id') || 0;
  const workItems = new WorkItems();
  const workers = new Workers();
  const workRequests = new WorkRequests();

  workers.renderList(document.getElementById('workers'));

  const workItem = await workItems.findWorkItemById(workItemId);
  const workRequest = new WorkRequest(workItem);

  workItems.renderWorkItem(document.getElementById('workitem'), workItem);
  workRequests.renderPrice(document.getElementById('price-editor'), workRequest, true);
  workRequests.renderInstructions(document.getElementById('instructions-editor'), workRequest, true, false);
};
