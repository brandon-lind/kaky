import { Profile } from './profile';

class KakyHeader extends HTMLElement {

  constructor() {
    super();
    this.profile = new Profile();

    this.innerHTML = `
    <nav class="navbar navbar-expand-lg navbar-light bg-light ps-3 pe-3">
      <a class="navbar-brand" href="/">KAKY</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNavDropdown">
        <ul class="navbar-nav me-auto">
          <li class="nav-item" id="login-container">
            <a class="nav-link" href="/index.html" id="login">Log In</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="/work-requests/index.html">New Work</a>
          </li>
          <li class="nav-item d-none" id="workrequests-container">
            <a class="nav-link" href="/work-requests/list.html">Work Requests</a>
          </li>
        </ul>
        <ul class="navbar-nav ms-auto">
          <li class="nav-item dropdown d-none" id="loggedin-container">
            <a href="#" class="nav-link dropdown-toggle" id="profileDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              <span title="KAKY Ninja"><i class="fas fa-user-ninja fa-2x"></i></span>
            </a>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="profileDropdown">
              <li><a class="dropdown-item" href="/profile.html" id="username"></a></li>
              <li><a class="dropdown-item" href="#" id="logout">Log Out</a></li>
            </ul>
          </li>
        </ul>
      </div>
    </nav>
    `;

    this.loginContainerEl = this.querySelector('#login-container');
    this.loggedinContainerEl = this.querySelector('#loggedin-container');
    this.workRequestsEl = this.querySelector('#workrequests-container');
    this.logoutEl = this.querySelector('#logout');

    this.logoutEl.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await this.profile.logout();
      } finally {
        window.location = '/index.html';
      }
    });

    if (this.profile.user) {
      this.displayLoggedIn(this.profile.user);
    }
  }

  displayLoggedIn(user) {
    this.loginContainerEl.classList.add('d-none');
    this.loggedinContainerEl.classList.remove('d-none');
    this.workRequestsEl.classList.remove('d-none');

    if (user.user_metadata && user.user_metadata.full_name) {
      this.loggedinContainerEl.querySelector('#username').textContent = `${user.user_metadata.full_name}`;
    } else {
      this.loggedinContainerEl.querySelector('#username').textContent = `Secret Ninja`;
    }
  }
}

export { KakyHeader };
