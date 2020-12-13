export async function workRequestSubmittedPage() {
  const parsedUrl = new URL(window.location.href);
  const workRequestId = parsedUrl.searchParams.get('id') || '';

  const viewDetailsLinkEl = document.querySelector('#view-details');

  viewDetailsLinkEl.setAttribute('href', viewDetailsLinkEl.href.replace('id=#', 'id='+ workRequestId));
};
