import { WorkRequests } from '../components/work-requests';
import { WorkItems } from '../components/work-items';

export async function workOpenPage() {
  const parsedUrl = new URL(window.location.href);
  const workRequestId = parsedUrl.searchParams.get('id') || 0;
  const workRequests = new WorkRequests();
  const workItems = new WorkItems();

  const workRequest = await workRequests.findWorkRequestById(workRequestId);

  const workItemTargetEl = document.querySelector('#workitem');
  const priceTargetEl = document.querySelector('#price');
  const instructionsTargetEl = document.querySelector('#instructions');

  workItems.renderWorkItemById(workItemTargetEl, workRequest.workItemId, false);
  workRequests.renderPrice(priceTargetEl, workRequest);
  workRequests.renderInstructions(instructionsTargetEl, workRequest);
};
