import 'bootstrap/js/dist/dropdown';
import { library, dom } from '@fortawesome/fontawesome-svg-core';
import { faBell, faDeaf, faHandHoldingUsd, faPray, faCheckCircle, faUserNinja } from '@fortawesome/free-solid-svg-icons';
import { KakyHeader } from './components/header';
import { KakyFooter } from './components/footer';
import { indexPage } from './pages/index';
import { profilePage } from './pages/profile';
import { workRequestAssignPage } from './pages/work-requests/assign';
import { workRequestDetailPage } from './pages/work-requests/detail';
import { workRequestIndexPage } from './pages/work-requests/index';
import { workRequestListPage } from './pages/work-requests/list';
import { workRequestSubmittedPage } from './pages/work-requests/submitted';


// We are only using these icons
library.add(faBell, faDeaf, faHandHoldingUsd, faPray, faCheckCircle, faUserNinja);

window.addEventListener('DOMContentLoaded', () => {
  window.customElements.define('kaky-footer', KakyFooter);
  window.customElements.define('kaky-header', KakyHeader);

  // Replaces any existing <i> tags with <svg> and sets up a MutationObserver to
  // continue doing this as the DOM changes.
  dom.i2svg();

  const currentUrl = new URL(window.location.href);

  switch (currentUrl.pathname.toLowerCase()) {
    case '/profile':
    case '/profile.html':
      profilePage();
      break;
    case '/work-requests/assign.html':
      workRequestAssignPage();
      break;
    case '/work-requests/detail.html':
      workRequestDetailPage();
      break;
    case '/work-requests/list.html':
      workRequestListPage();
      break;
    case '/work-requests/submitted.html':
      workRequestSubmittedPage();
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
