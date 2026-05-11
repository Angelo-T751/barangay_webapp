// apply.js – form handling, tracking code generation, file upload, success message below form

document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('certificateForm');
  const successMessageDiv = document.getElementById('successMessage');
  const trackingCodeSpan = document.getElementById('trackingCodeDisplay');
  const cancelBtn = document.getElementById('cancelBtn');
  const uploadArea = document.getElementById('uploadArea');
  const fileInput = document.getElementById('fileInput');
  const filePreviewDiv = document.getElementById('filePreview');
  const fileNameSpan = filePreviewDiv.querySelector('.file-name');
  const removeFileBtn = document.getElementById('removeFileBtn');

  let selectedFile = null;

  // ---- FILE UPLOAD HANDLING ----
  uploadArea.addEventListener('click', (e) => {
    if (e.target.closest('.remove-file')) return;
    fileInput.click();
  });

  fileInput.addEventListener('change', (e) => {
    if (fileInput.files.length) {
      selectedFile = fileInput.files[0];
      updateFilePreview(selectedFile.name);
    }
  });

  function updateFilePreview(name) {
    fileNameSpan.textContent = name;
    filePreviewDiv.classList.remove('hidden');
    document.querySelector('.upload-message').style.display = 'none';
  }

  function resetFileUpload() {
    selectedFile = null;
    fileInput.value = '';
    filePreviewDiv.classList.add('hidden');
    document.querySelector('.upload-message').style.display = 'block';
  }

  removeFileBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    resetFileUpload();
  });

  // Drag & drop
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = 'var(--gold)';
  });
  uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.borderColor = '#cbd5e1';
  });
  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#cbd5e1';
    const files = e.dataTransfer.files;
    if (files.length) {
      selectedFile = files[0];
      updateFilePreview(selectedFile.name);
      fileInput.files = files;
    }
  });

  // ---- TRACKING CODE GENERATION ----
  function generateTrackingCode() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `BRGY-${year}-${month}-${day}-${random}`;
  }

  // ---- FORM SUBMIT ----
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const trackingCode = generateTrackingCode();
    trackingCodeSpan.textContent = trackingCode;

    // Show success message below form (do NOT hide the form)
    successMessageDiv.classList.remove('hidden');

    // Store submission in localStorage for tracking page
    const submission = {
      trackingCode,
      firstName: document.getElementById('firstName').value,
      lastName: document.getElementById('lastName').value,
      certType: document.getElementById('certType').value,
      submittedAt: new Date().toISOString()
    };
    let submissions = JSON.parse(localStorage.getItem('barangay_applications') || '[]');
    submissions.push(submission);
    localStorage.setItem('barangay_applications', JSON.stringify(submissions));

    // Reset the form fields and file upload for a new application
    form.reset();
    resetFileUpload();

    // Optional: scroll success message into view
    successMessageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  // ---- CANCEL BUTTON ----
  cancelBtn.addEventListener('click', () => {
    if (confirm('Cancel application? All entered data will be lost.')) {
      form.reset();
      resetFileUpload();
      // Also hide success message if visible
      successMessageDiv.classList.add('hidden');
    }
  });
});