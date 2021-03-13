class WorkRequest {
  constructor(workRequest = null, workItem = null) {
    this._id = 0;
    this.__v = 0;
    this.createdAt = '';
    this.instructions = '';
    this.price = 1;
    this.requesterId = '';
    this.status = 'unknown';
    this.updatedAt = '';
    this.workItemId = 0;
    this.workerId = '';

    this.map(workRequest);
    this.mapWorkItem(workItem);
  }

  map(workRequest) {
    if (!workRequest) return;

    this._id = workRequest._id || '';
    this.__v = workRequest.__v || 0;
    this.createdAt = workRequest.createdAt || '';
    this.instructions = workRequest.instructions || '';
    this.price = workRequest.price || 1;
    this.requesterId = workRequest.requesterId || '';
    this.status = workRequest.status || 'unknown';
    this.updatedAt = workRequest.updatedAt || '';
    this.workItemId = workRequest.workItemId || 0;
    this.workerId = workRequest.workerId || '';
  }

  mapWorkItem(workItem) {
    if (!workItem) return;

    this.price = workItem.price || 1;
    this.workItemId = workItem.id || 0;
  }

  isValid() {
    if (isNaN(this.price) || this.price < 1 || this.price > 100) return false;
    if (!this.requesterId) return false;
    if (isNaN(this.workItemId) || this.workItemId < 1) return false;
    if (!this.workerId) return false;

    const validStatus = ['open', 'closed', 'cancelled', 'paid', 'rejected', 'working', 'waiting_for_payment'];

    if (validStatus.indexOf(this.status) === -1) return false;

    return true;
  }
}

export { WorkRequest };
