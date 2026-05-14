document.addEventListener('DOMContentLoaded', function() {
  const searchBtn = document.getElementById('searchBtn');
  const trackingInput = document.getElementById('trackingCodeInput');
  const resultCard = document.getElementById('resultCard');
  const noResultCard = document.getElementById('noResultCard');
  const trackAnotherBtns = document.querySelectorAll('#trackAnotherBtn, #noResultTrackAnotherBtn');

  const statusBadge = document.getElementById('statusBadge');
  const trackingCodeDisplay = document.getElementById('trackingCodeDisplay');
  const fullNameSpan = document.getElementById('fullName');
  const emailSpan = document.getElementById('email');
  const phoneSpan = document.getElementById('phone');
  const addressSpan = document.getElementById('address');
  const documentsListDiv = document.getElementById('documentsList');
  const certTypeSpan = document.getElementById('certType');
  const purposeSpan = document.getElementById('purpose');
  const dateSubmittedSpan = document.getElementById('dateSubmitted');
  const remarksSection = document.getElementById('remarksSection');
  const remarksText = document.getElementById('remarksText');
  const downloadSection = document.getElementById('downloadSection');
  const downloadBtn = document.getElementById('downloadBtn');

  function getApplications() {
    return JSON.parse(localStorage.getItem('barangay_applications') || '[]');
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function displayApplication(app) {
    const status = app.status || 'Pending';
    statusBadge.textContent = status.toUpperCase();
    statusBadge.className = `status-badge ${status.toLowerCase()}`;
    trackingCodeDisplay.textContent = app.trackingCode;

    fullNameSpan.textContent = `${app.firstName || ''} ${app.lastName || ''}`.trim() || 'N/A';
    emailSpan.textContent = app.email || 'N/A';
    phoneSpan.textContent = app.phone || 'N/A';
    const addressParts = [app.house, app.street, app.barangay, app.city].filter(p => p);
    addressSpan.textContent = addressParts.length ? addressParts.join(', ') : 'N/A';

    documentsListDiv.innerHTML = '';
    if (app.fileName) {
      const docItem = document.createElement('div');
      docItem.className = 'doc-item';
      docItem.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
          <polyline points="13 2 13 9 20 9"/>
        </svg>
        <span>${app.fileName}</span>
      `;
      documentsListDiv.appendChild(docItem);
    } else {
      documentsListDiv.innerHTML = '<p class="text-muted">No documents uploaded</p>';
    }

    certTypeSpan.textContent = app.certType || 'N/A';
    purposeSpan.textContent = app.purpose || 'N/A';
    dateSubmittedSpan.textContent = app.submittedAt ? formatDate(app.submittedAt) : 'N/A';

    if (status.toLowerCase() === 'rejected' && app.remarks) {
      remarksSection.classList.remove('hidden');
      remarksText.textContent = app.remarks;
    } else {
      remarksSection.classList.add('hidden');
    }

    if (status.toLowerCase() === 'approved') {
      downloadSection.classList.remove('hidden');
    } else {
      downloadSection.classList.add('hidden');
    }

    resultCard.classList.remove('hidden');
    noResultCard.classList.add('hidden');
  }

  function searchApplication() {
    const code = trackingInput.value.trim().toUpperCase();
    if (!code) {
      alert('Please enter a tracking code.');
      return;
    }

    const apps = getApplications();
    const found = apps.find(app => app.trackingCode === code);

    if (found) {
      displayApplication(found);
    } else {
      resultCard.classList.add('hidden');
      noResultCard.classList.remove('hidden');
    }
  }

  function resetToSearch() {
    trackingInput.value = '';
    resultCard.classList.add('hidden');
    noResultCard.classList.add('hidden');
  }

  function downloadCertificate() {
    alert('Certificate download will be available soon.\n(This is a demo placeholder.)');
  }

  searchBtn.addEventListener('click', searchApplication);
  trackingInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchApplication();
  });
  trackAnotherBtns.forEach(btn => {
    btn.addEventListener('click', resetToSearch);
  });
  if (downloadBtn) downloadBtn.addEventListener('click', downloadCertificate);
});