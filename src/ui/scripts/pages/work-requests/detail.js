import { WorkRequests } from '../../components/work-requests';
import { WorkItems } from '../../components/work-items';
import { Workers } from '../../components/workers';

export async function workRequestDetailPage() {
  const parsedUrl = new URL(window.location.href);
  const workRequestId = parsedUrl.searchParams.get('id') || '';
  const workRequests = new WorkRequests();
  const workItems = new WorkItems();
  const workers = new Workers();

  const workRequest = await workRequests.findWorkRequestById(workRequestId);

  const workItemTargetEl = document.querySelector('#workitem');
  const workerTargetEl = document.querySelector('#worker');
  const priceTargetEl = document.querySelector('#price');
  const instructionsTargetEl = document.querySelector('#instructions');
  const actionsTargetEl = document.querySelector('.kaky-actions');
  const errorMessageTargetEl = document.querySelector('.kaky-error-message');
  const rapidReorderEl = document.querySelector('.kaky-rapid-reorder');

  workItems.renderWorkItemById(workItemTargetEl, workRequest.workItemId, false);
  workers.renderWorkerById(workerTargetEl, workRequest.workerId);
  workRequests.renderPrice(priceTargetEl, workRequest);
  workRequests.renderInstructions(instructionsTargetEl, workRequest);
  workRequests.renderActions(actionsTargetEl, workRequest);
};
