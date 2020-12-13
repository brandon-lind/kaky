import netlifyIdentity from 'netlify-identity-widget';
class KakyHeader extends HTMLElement {

  constructor() {
    super();
    this.innerHTML = `
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <a class="navbar-brand" href="/">KAKY</a>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNavDropdown">
        <ul class="navbar-nav">
          <li class="nav-item">
            <a class="nav-link" href="index.html">Work Items</a>
          </li>
          <li class="nav-item login">
            <a class="nav-link" href="#">Log In</a>
          </li>
          <li class="nav-item loggedin d-none">
            <a class="nav-link logout" href="#">Log Out <small></small></a>
          </li>
        </ul>
      </div>
    </nav>
    `;

    this.loginContainerEl = this.querySelector('li.login');
    this.loggedinContainerEl = this.querySelector('li.loggedin');
    this.loginEl = this.querySelector('li.login a');
    this.logoutEl = this.querySelector('a.logout');

    this.loginEl.addEventListener('click', this.handleLoginRequest);
    this.logoutEl.addEventListener('click', this.handleLogoutRequest);

    netlifyIdentity.on('login', (user) => this.displayLoggedIn(user));
    netlifyIdentity.on('logout', () => { window.location.href = 'index.html'; });
    netlifyIdentity.on('init', user => {
      if (user) {
        this.displayLoggedIn(user);
      }
    });

    netlifyIdentity.init();
  }

  handleLoginRequest(e) {
    e.preventDefault();
    netlifyIdentity.open();
  }

  handleLogoutRequest(e) {
    e.preventDefault();
    netlifyIdentity.logout();
  }

  displayLoggedIn(user) {
    this.loginContainerEl.classList.add('d-none');
    this.loggedinContainerEl.classList.remove('d-none');

    if (user.user_metadata && user.user_metadata.full_name) {
      this.loggedinContainerEl.querySelector('small').innerHTML = `(${user.user_metadata.full_name})`;
    }
  }
}

export { KakyHeader };
