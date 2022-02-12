export async function workRequestSubmittedPage() {
  const parsedUrl = new URL(window.location.href);
  let workRequestId = parsedUrl.searchParams.get('id') || '';

  const viewDetailsLinkEl = document.querySelector('#view-details');

  // Sanitize
  try {
    workRequestId = workRequestId.replace(/[^0-9a-z]+/gi,'');
  } catch (e) {
    workRequestId = '';
  }

  viewDetailsLinkEl.setAttribute('href', viewDetailsLinkEl.href.replace('id=#', 'id='+ workRequestId));
};
