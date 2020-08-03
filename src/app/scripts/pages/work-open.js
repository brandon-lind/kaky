import { WorkRequests } from '../components/work-requests';
import { WorkItems } from '../components/workitems';

export async function workOpenPage() {
  const parsedUrl = new URL(window.location.href);
  const workRequestId = parsedUrl.searchParams.get('id') || 0;
  const workRequests = new WorkRequests();
  const workItems = new WorkItems();

  const workRequest = await workRequests.findWorkRequestById(workRequestId);

  workItems.renderWorkItemById(document.getElementById('workitem'), workRequest.workItemId, false);
  workRequests.renderPrice(document.getElementById('price'), workRequest);
  workRequests.renderInstructions(document.getElementById('instructions'), workRequest);
};
