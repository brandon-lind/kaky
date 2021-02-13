import 'bootstrap/js/dist/collapse';
import { KakyHeader } from './components/header';
import { KakyFooter } from './components/footer';
import { indexPage } from './pages/index';
import { workRequestAssignPage } from './pages/work-requests/assign';
import { workRequestIndexPage } from './pages/work-requests/index';
import { workRequestListPage } from './pages/work-requests/list';
import { workRequestSubmittedPage } from './pages/work-requests/submitted';
import { workRequestWorkOpenPage } from './pages/work-requests/work-open';
import { library, dom } from '@fortawesome/fontawesome-svg-core';
import { faDeaf, faHandHoldingUsd, faPray, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

// We are only using these icons
library.add(faDeaf, faHandHoldingUsd, faPray, faCheckCircle);

window.addEventListener('DOMContentLoaded', () => {
  window.customElements.define('kaky-footer', KakyFooter);
  window.customElements.define('kaky-header', KakyHeader);

  // Replace any existing <i> tags with <svg> and set up a MutationObserver to
  // continue doing this as the DOM changes.
  dom.i2svg();

  const currentUrl = new URL(window.location.href);

  switch (currentUrl.pathname.toLowerCase()) {
    case '/work-requests/submitted.html':
      workRequestSubmittedPage();
      break;
    case '/work-requests/assign.html':
      workRequestAssignPage();
      break;
    case '/work-requests/work-open.html':
      workRequestWorkOpenPage();
      break;
    case '/work-requests/list.html':
      workRequestListPage();
      break;
    case '/work-requests':
    case '/work-requests/':
    case '/work-requests/index.html':
      workRequestIndexPage();
      break;
    default:
      indexPage();
  }
});
