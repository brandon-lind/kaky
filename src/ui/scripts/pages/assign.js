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

  const workersTargetEl = document.querySelector('#workers');
  const workItemTargetEl = document.querySelector('#workitem');
  const priceEditorTargetEl = document.querySelector('#price-editor');
  const instructionsEditorTargetEl = document.querySelector('#instructions-editor');

  workers.renderList(workersTargetEl);

  const workItem = await workItems.findWorkItemById(workItemId);
  const workRequest = new WorkRequest(workItem);

  workItems.renderWorkItem(workItemTargetEl, workItem);
  workRequests.renderPrice(priceEditorTargetEl, workRequest, true);
  workRequests.renderInstructions(instructionsEditorTargetEl, workRequest, true, false);
};
