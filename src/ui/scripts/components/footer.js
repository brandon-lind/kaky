class KakyFooter extends HTMLElement {

  constructor() {
    super();
    this.innerHTML = `
    <footer class="mt-5 pt-4 my-md-5 pt-md-5 border-top">
      <div class="row">
        <div class="col-12 col-md">
          <small class="d-block mb-3 text-muted">&copy; 2022 Lind Software, LLC</small>
        </div>
      </div>
    </footer>
    `;
  }

}

export { KakyFooter };
