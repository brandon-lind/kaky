import { KakyHeader } from './components/header';
import { KakyFooter } from './components/footer';
import { assignPage } from './pages/assign';
import { indexPage } from './pages/index';
import { workOpenPage } from './pages/work-open';
import '../assets/style.css';

(() => {
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
})();

