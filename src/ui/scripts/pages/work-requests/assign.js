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
  const fieldsetEl = formTargetEl.querySelector('fieldset');
  const errorMessageTargetEl = document.querySelector('#error-message');

  const workItem = await workItems.findWorkItemById(workItemId);
  const workRequest = new WorkRequest(null, workItem);

  workers.renderList(workersTargetEl, workRequest, true);
  workItems.renderWorkItem(workItemTargetEl, workItem);
  workRequests.renderPrice(priceEditorTargetEl, workRequest, true);
  workRequests.renderInstructions(instructionsEditorTargetEl, workRequest, true, false);

  formTargetEl.addEventListener('submit', async (evt) => {
    try {
      const workRequestId = await workRequests.handleSubmit(evt, workRequest);
      const redirectUrl = formTargetEl.action.replace('id=#', 'id='+ workRequestId);
      window.location = redirectUrl;
    } catch(e) {
      fieldsetEl.disabled = false;
      errorMessageTargetEl.classList.remove('d-none');
      errorMessageTargetEl.innerHTML = e.message;
    }
  });
};
