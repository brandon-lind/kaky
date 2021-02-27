import { Workers } from '../../components/workers';
import { WorkItems } from '../../components/work-items';
import { WorkRequests } from '../../components/work-requests';

export async function workRequestListPage() {
  const workers = new Workers();
  const workItems = new WorkItems();
  const workRequests = new WorkRequests();

  const cancelledBadgeEl = document.querySelector('#list-cancelled-workrequests .badge');
  const closedBadgeEl = document.querySelector('#list-closed-workrequests .badge');
  const openBadgeEl = document.querySelector('#list-open-workrequests .badge');
  const paidBadgeEl = document.querySelector('#list-paid-workrequests .badge');
  const rejectedBadgeEl = document.querySelector('#list-rejected-workrequests .badge');
  const waitingForPaymentBadgeEl = document.querySelector('#list-waiting-on-payment-workrequests .badge');
  const workingBadgeEl = document.querySelector('#list-working-workrequests .badge');

  const cancelledListEl = document.querySelector('#list-cancelled > ul');
  const closedListEl = document.querySelector('#list-closed > ul');
  const openListEl = document.querySelector('#list-open > ul');
  const paidListEl = document.querySelector('#list-paid > ul');
  const rejectedListEl = document.querySelector('#list-rejected > ul');
  const waitingForPaymentListEl = document.querySelector('#list-waiting-on-payment > ul');
  const workingListEl = document.querySelector('#list-working > ul');

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
      console.warn(`The worker ${workRequest.workerId} was not found for work request ${workRequest.__id}`);
      continue;
    }

    if (!workItem) {
      console.warn(`The work item ${workRequest.workItemId} was not found for work request ${workRequest.__id}`);
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
  cancelledBadgeEl.innerHTML = `${cancelledCount}`;
  closedBadgeEl.innerHTML = `${closedCount}`;
  openBadgeEl.innerHTML = `${openCount}`;
  paidBadgeEl.innerHTML = `${paidCount}`;
  rejectedBadgeEl.innerHTML = `${rejectedCount}`;
  waitingForPaymentBadgeEl.innerHTML = `${waitingForPaymentCount}`;
  workingBadgeEl.innerHTML = `${workingCount}`;
};
