import { KakyHeader } from './components/header';
import { KakyFooter } from './components/footer';
import { assignPage } from './pages/work-requests/assign';
import { indexPage } from './pages/work-requests/index';
import { submittedPage } from './pages/work-requests/submitted';
import { workOpenPage } from './pages/work-requests/work-open';
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
      submittedPage();
      break;
    case '/work-requests/assign.html':
      assignPage();
      break;
    case '/work-requests/work-open.html':
      workOpenPage();
      break;
    default:
      indexPage();
      break;
  }
});
