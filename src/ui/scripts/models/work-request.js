class WorkRequest {
  constructor(workItem) {
    this.id = 0;
    this.workItemId = 0;
    this.workerId = '';
    this.requesterId = '';
    this.price = 1;
    this.instructions = '';
    this.status = 'unknown';

    this.mapWorkItem(workItem);
  }

  mapWorkItem(workItem) {
    if (!workItem) return;

    this.workItemId = workItem.id || 0;
    this.price = workItem.price || 1;
  }

  isValid() {
    if (isNaN(this.workItemId) || this.workItemId < 1) return false;
    if (!this.workerId) return false;
    if (!this.requesterId) return false;
    if (isNaN(this.price) || this.price < 1) return false;

    const validStatus = ['open', 'closed', 'cancelled', 'paid', 'rejected', 'working', 'waiting for payment'];

    return validStatus.find(s => s === this.status);
  }
}

export { WorkRequest };
