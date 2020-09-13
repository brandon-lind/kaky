import { KakyHeader } from './components/header';
import { KakyFooter } from './components/footer';
import { assignPage } from './pages/assign';
import { indexPage } from './pages/index';
import { workOpenPage } from './pages/work-open';
import '@fortawesome/fontawesome-free/js/fontawesome';
import '@fortawesome/fontawesome-free/js/solid';
import '@fortawesome/fontawesome-free/js/regular';
import '@fortawesome/fontawesome-free/js/brands';

window.addEventListener('DOMContentLoaded', () => {
  window.customElements.define('kaky-footer', KakyFooter);
  window.customElements.define('kaky-header', KakyHeader);

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
