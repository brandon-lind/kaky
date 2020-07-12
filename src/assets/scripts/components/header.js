class KakyHeader extends HTMLElement {

  constructor() {
    super();
    this.innerHTML = `
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <a class="navbar-brand" href="#">KAKY</a>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNavDropdown">
        <ul class="navbar-nav">
          <li class="nav-item">
            <a class="nav-link" href="index.html">Work Items</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">Pricing</a>
          </li>
          <li class="nav-item login">
            <a class="nav-link" href="#">Log In</a>
          </li>
          <li class="nav-item dropdown loggedin d-none">
            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            <i class="far fa-user-circle"></i>
            </a>
            <div class="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
              <span class="dropdown-item disabled fullname"></span>
              <div class="dropdown-divider"></div>
              <a class="dropdown-item logout" href="#">Log Out</a>
            </div>
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
      this.loggedinContainerEl.querySelector('span.fullname').innerHTML = user.user_metadata.full_name;
    }
  }
}

window.customElements.define('kaky-header', KakyHeader);
