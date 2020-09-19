import { KakyHeader } from './components/header';
import { KakyFooter } from './components/footer';
import { assignPage } from './pages/assign';
import { indexPage } from './pages/index';
import { workOpenPage } from './pages/work-open';
import { library, dom } from '@fortawesome/fontawesome-svg-core';
import { faDeaf, faHandHoldingUsd, faPray } from '@fortawesome/free-solid-svg-icons';

// We are only using these icons
library.add(faDeaf, faHandHoldingUsd, faPray);

window.addEventListener('DOMContentLoaded', () => {
  window.customElements.define('kaky-footer', KakyFooter);
  window.customElements.define('kaky-header', KakyHeader);

  // Replace any existing <i> tags with <svg> and set up a MutationObserver to
  // continue doing this as the DOM changes.
  dom.i2svg();

  const currentUrl = new URL(window.location.href);

  switch (currentUrl.pathname.toLowerCase()) {
    case '/assign.html':
      assignPage();
      break;
    case '/work-open.html':
      workOpenPage();
      break;
    default:
      indexPage();
      break;
  }
});
