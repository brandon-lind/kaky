import netlifyIdentity from 'netlify-identity-widget';

export async function indexPage() {
  const startButtonEl = document.querySelector('button');
  netlifyIdentity.on('login', () => {
    location.href = '/work-requests/list.html';
  });

  startButtonEl.addEventListener('click', (e) => {
    e.preventDefault();
    netlifyIdentity.open();
  });

  netlifyIdentity.init();
};
