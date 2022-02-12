import { Workers } from '../../components/workers';
import { WorkItems } from '../../components/work-items';
import { WorkRequests } from '../../components/work-requests';

export async function workRequestListPage() {
  const workers = new Workers();
  const workItems = new WorkItems();
  const workRequests = new WorkRequests();

  const cancelledBadgeEl = document.querySelector('#workrequests-cancelled .badge');
  const closedBadgeEl = document.querySelector('#workrequests-closed .badge');
  const openBadgeEl = document.querySelector('#workrequests-open .badge');
  const paidBadgeEl = document.querySelector('#workrequests-paid .badge');
  const rejectedBadgeEl = document.querySelector('#workrequests-rejected .badge');
  const waitingForPaymentBadgeEl = document.querySelector('#workrequests-waiting-on-payment .badge');
  const workingBadgeEl = document.querySelector('#workrequests-working .badge');

  const cancelledListEl = document.querySelector('#workrequests-collapse-cancelled .card-body');
  const closedListEl = document.querySelector('#workrequests-collapse-closed .card-body');
  const openListEl = document.querySelector('#workrequests-collapse-open .card-body');
  const paidListEl = document.querySelector('#workrequests-collapse-paid .card-body');
  const rejectedListEl = document.querySelector('#workrequests-collapse-rejected .card-body');
  const waitingForPaymentListEl = document.querySelector('#workrequests-collapse-waiting-on-payment .card-body');
  const workingListEl = document.querySelector('#workrequests-collapse-working .card-body');

  const noWorkRequestsTxt = 'There are no work requests in this status.';

  const data = await workRequests.fetchWorkRequests();

  // Get counts based on status
  let cancelledCount = 0;
  let closedCount = 0;
  let openCount = 0;
  let paidCount = 0;
  let rejectedCount = 0;
  let waitingForPaymentCount = 0;
  let workingCount = 0;

  for (const workRequest of data) {
    const worker = await workers.findWorkerById(workRequest.workerId);
    const workItem = await workItems.findWorkItemById(workRequest.workItemId);

    if (!worker) {
      console.warn(`The worker ${workRequest.workerId} was not found for work request ${workRequest._id}`);
      continue;
    }

    if (!workItem) {
      console.warn(`The work item ${workRequest.workItemId} was not found for work request ${workRequest._id}`);
      continue;
    }

    let statusNode = workRequests.createStatusNode(workRequest, workItem, worker);
    switch (workRequest.status) {
      case 'cancelled':
        cancelledListEl.append(statusNode);
        cancelledCount++;
        break;
      case 'closed':
        closedListEl.append(statusNode);
        closedCount++;
        break;
      case 'open':
        openListEl.append(statusNode);
        openCount++;
        break;
      case 'paid':
        paidListEl.append(statusNode);
        paidCount++;
        break;
      case 'rejected':
        rejectedListEl.append(statusNode);
        rejectedCount++;
        break;
      case 'waiting_for_payment':
        waitingForPaymentListEl.append(statusNode);
        waitingForPaymentCount++;
        break;
      case 'working':
        workingListEl.append(statusNode);
        workingCount++;
        break;
      default:
        break;
    }
  }

  // Update the status labels
  cancelledBadgeEl.textContent = `${cancelledCount}`;
  closedBadgeEl.textContent = `${closedCount}`;
  openBadgeEl.textContent = `${openCount}`;
  paidBadgeEl.textContent = `${paidCount}`;
  rejectedBadgeEl.textContent = `${rejectedCount}`;
  waitingForPaymentBadgeEl.textContent = `${waitingForPaymentCount}`;
  workingBadgeEl.textContent = `${workingCount}`;

  // Add indicator for statuses without work requests
  if (cancelledCount === 0) { cancelledListEl.textContent = noWorkRequestsTxt; }
  if (closedCount === 0) { closedListEl.textContent = noWorkRequestsTxt; }
  if (openCount === 0) { openListEl.textContent = noWorkRequestsTxt; }
  if (paidCount === 0) { paidListEl.textContent = noWorkRequestsTxt; }
  if (rejectedCount === 0) { rejectedListEl.textContent = noWorkRequestsTxt; }
  if (waitingForPaymentCount === 0) { waitingForPaymentListEl.textContent = noWorkRequestsTxt; }
  if (workingCount === 0) { workingListEl.textContent = noWorkRequestsTxt; }
};
