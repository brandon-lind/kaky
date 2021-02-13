import { WorkRequests } from '../../components/work-requests';

export async function workRequestListPage() {
  const workRequests = new WorkRequests();
  const openTargetEl = document.querySelector('#open-workrequests');
  const closedTargetEl = document.querySelector('#closed-workrequests');
  const cancelledTargetEl = document.querySelector('#cancelled-workrequests');
  const paidTargetEl = document.querySelector('#paid-workrequests');
  const rejectedTargetEl = document.querySelector('#rejected-workrequests');
  const workingTargetEl = document.querySelector('#working-workrequests');
  const waitingForPaymentTargetEl = document.querySelector('#waiting-for-payment-workrequests');



  const data = await workRequests.fetchWorkRequests();

  data.forEach(workRequest => {
    let statusNode = workRequests.createStatusNode(workRequest);
    switch (workRequest.status) {
      case 'open':
        openTargetEl.append(statusNode);
        break;
      case 'closed':
        closedTargetEl.append(statusNode);
        break;
      case 'cancelled':
        cancelledTargetEl.append(statusNode);
        break;
      case 'paid':
        paidTargetEl.append(statusNode);
        break;
      case 'rejected':
        rejectedTargetEl.append(statusNode);
        break;
      case 'working':
        workingTargetEl.append(statusNode);
        break;
      case 'waiting_for_payment':
        waitingForPaymentTargetEl.append(statusNode);
        break;
      default:
        break;
    }
  });
};
