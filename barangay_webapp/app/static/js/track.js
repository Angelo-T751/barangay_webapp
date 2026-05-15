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

  function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function displayApplication(app) {
    const status = app.status || 'Pending';
    if (statusBadge) {
      statusBadge.textContent = status.toUpperCase();
      statusBadge.className = `status-badge ${status.toLowerCase()}`;
    }
    if (trackingCodeDisplay) trackingCodeDisplay.textContent = app.trackingCode;

    if (fullNameSpan) fullNameSpan.textContent = `${app.firstName || ''} ${app.lastName || ''}`.trim() || 'N/A';
    if (emailSpan) emailSpan.textContent = app.email || 'N/A';
    if (phoneSpan) phoneSpan.textContent = app.phone || 'N/A';
    
    if (addressSpan) {
      const addressParts = [app.house, app.street, app.barangay, app.city].filter(p => p);
      addressSpan.textContent = addressParts.length ? addressParts.join(', ') : 'N/A';
    }

    if (documentsListDiv) {
      documentsListDiv.innerHTML = '';
      if (app.fileName) {
        const docItem = document.createElement('div');
        docItem.className = 'doc-item';
        docItem.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px; margin-right:8px; vertical-align:middle;">
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
            <polyline points="13 2 13 9 20 9"/>
          </svg>
          <span>${app.fileName}</span>
        `;
        documentsListDiv.appendChild(docItem);
      } else {
        documentsListDiv.innerHTML = '<p class="text-muted">No documents uploaded</p>';
      }
    }

    if (certTypeSpan) certTypeSpan.textContent = app.certType || 'N/A';
    if (purposeSpan) purposeSpan.textContent = app.purpose || 'N/A';
    if (dateSubmittedSpan) dateSubmittedSpan.textContent = app.submittedAt ? formatDate(app.submittedAt) : 'N/A';

    if (remarksSection && remarksText) {
      if (status.toLowerCase() === 'rejected' && app.remarks) {
        remarksSection.classList.remove('hidden');
        remarksText.textContent = app.remarks;
      } else {
        remarksSection.classList.add('hidden');
      }
    }

    if (downloadSection) {
      if (status.toLowerCase() === 'approved') {
        downloadSection.classList.remove('hidden');
      } else {
        downloadSection.classList.add('hidden');
      }
    }

    if (resultCard) resultCard.classList.remove('hidden');
    if (noResultCard) noResultCard.classList.add('hidden');
  }

  async function searchApplication(e) {
    if (e) e.preventDefault();
    
    const code = trackingInput ? trackingInput.value.trim() : '';
    if (!code) {
      alert('Please enter a tracking code.');
      return;
    }

    try {
      const response = await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tracking_code: code })
      });

      if (response.ok) {
        const data = await response.json();
        displayApplication(data);
      } else {
        if (resultCard) resultCard.classList.add('hidden');
        if (noResultCard) noResultCard.classList.remove('hidden');
      }
    } catch (error) {
      console.error("Error connecting to server:", error);
      alert("Server connection failed.");
    }
  }

  function resetToSearch() {
    if (trackingInput) trackingInput.value = '';
    if (resultCard) resultCard.classList.add('hidden');
    if (noResultCard) noResultCard.classList.add('hidden');
  }

  if (searchBtn) searchBtn.addEventListener('click', searchApplication);
  if (trackingInput) trackingInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') searchApplication(e); });
  if (trackAnotherBtns) trackAnotherBtns.forEach(btn => btn.addEventListener('click', resetToSearch));

  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      alert('Your certificate is ready! Secure file download will be available shortly.');
    });
  }
});