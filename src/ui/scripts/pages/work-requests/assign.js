import { WorkRequest } from '../../models/work-request';
import { WorkRequests } from '../../components/work-requests';
import { WorkItems } from '../../components/work-items';
import { Workers } from '../../components/workers';

export async function workRequestAssignPage() {
  const parsedUrl = new URL(window.location.href);
  const workItemId = parsedUrl.searchParams.get('id') || 0;
  const workItems = new WorkItems();
  const workers = new Workers();
  const workRequests = new WorkRequests();

  const workersTargetEl = document.querySelector('#workers');
  const workItemTargetEl = document.querySelector('#workitem');
  const priceEditorTargetEl = document.querySelector('#price-editor');
  const instructionsEditorTargetEl = document.querySelector('#instructions-editor');
  const formTargetEl = document.querySelector('form');
  const errorMessagesTargetEl = document.querySelector('#error-messages');

  const workItem = await workItems.findWorkItemById(workItemId);
  const workRequest = new WorkRequest(workItem);

  workers.renderList(workersTargetEl, workRequest, true);
  workItems.renderWorkItem(workItemTargetEl, workItem);
  workRequests.renderPrice(priceEditorTargetEl, workRequest, true);
  workRequests.renderInstructions(instructionsEditorTargetEl, workRequest, true, false);

  formTargetEl.addEventListener('submit', (e) => { workRequests.handleSubmit(e, errorMessagesTargetEl, workRequest); });
};
