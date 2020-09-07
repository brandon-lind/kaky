class WorkRequest {
  constructor(workItem) {
    this.id = 0;
    this.workItemId = 0;
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
}

export { WorkRequest };
