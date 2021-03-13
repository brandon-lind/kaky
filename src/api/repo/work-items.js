import * as rawItems from '../data/work-items.json';

const findWorkItemById = function(id) {
  return rawItems.default.find(x => x.id === id);
}

const getWorkItems = function() {
  return rawItems.default;
}

export { findWorkItemById, getWorkItems };
