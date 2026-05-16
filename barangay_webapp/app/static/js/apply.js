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

  function showFileError(message) {
    const existingError = document.querySelector('.file-upload-error');
    if (existingError) existingError.remove();

    const errorDiv = document.createElement('div');
    errorDiv.className = 'file-upload-error';
    errorDiv.style.color = '#991b1b';
    errorDiv.style.fontSize = '0.7rem';
    errorDiv.style.marginTop = '0.5rem';
    errorDiv.style.textAlign = 'center';
    errorDiv.innerText = message;
    uploadArea.parentNode.appendChild(errorDiv);

    setTimeout(() => {
      if (errorDiv && errorDiv.remove) errorDiv.remove();
    }, 4000);
  }

  uploadArea.addEventListener('click', (e) => {
    if (e.target.closest('.remove-file')) return;
    fileInput.click();
  });

  fileInput.addEventListener('change', (e) => {
    if (fileInput.files.length) {
      updateFilePreview(fileInput.files);
      const existingError = document.querySelector('.file-upload-error');
      if (existingError) existingError.remove();
    }
  });

  function updateFilePreview(files) {
    // Extract all file names and join them so the user sees exactly what they attached
    fileNameSpan.textContent = Array.from(files).map(f => f.name).join(', ');
    filePreviewDiv.classList.remove('hidden');
    document.querySelector('.upload-message').style.display = 'none';
  }

  function resetFileUpload() {
    fileInput.value = '';
    filePreviewDiv.classList.add('hidden');
    document.querySelector('.upload-message').style.display = 'block';
  }

  removeFileBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    resetFileUpload();
  });

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
      fileInput.files = files;
      updateFilePreview(files);
      const existingError = document.querySelector('.file-upload-error');
      if (existingError) existingError.remove();
    }
  });

  form.addEventListener('submit', (e) => {
    if (!form.checkValidity()) {
      e.preventDefault();
      form.reportValidity();
      return;
    }

    if (fileInput.files.length === 0) {
      e.preventDefault();
      showFileError('Please upload the required document(s) (PDF or image, max 25MB).');
      return;
    }
  });

  cancelBtn.addEventListener('click', () => {
    if (confirm('Cancel application? All entered data will be lost.')) {
      form.reset();
      resetFileUpload();
      successMessageDiv.classList.add('hidden');
      const existingError = document.querySelector('.file-upload-error');
      if (existingError) existingError.remove();
    }
  });

  // Certificate Requirements Logic
  const certTypeDropdown = document.getElementById('certType');
  const requirementsContainer = document.getElementById('certRequirements');
  const requirementsList = document.getElementById('requirementsList');

  const requirementsMap = {
      'Barangay Clearance': [
          "Valid government-issued ID (Driver's License, Passport, Voter's ID, PhilHealth ID, UMID/SSS ID, Postal ID)",
          "Proof of Residency (utility bill, lease contract, or homeowner's association certificate)",
          "Community Tax Certificate (Cedula) / Certificate of Indigency"
      ],
      'Certificate of Indigency': [
          "Barangay Clearance",
          "Valid ID"
      ],
      'Certificate of Residency': [
          "Two proofs of residency (utility bills, lease contract/land title, voter's registration record, or affidavit of residency from neighbors/landlord)",
          "Valid ID"
      ],
      'Business Clearance': [
          "DTI or SEC Registration",
          "Barangay Clearance",
          "Lease Contract or Proof of Business Location",
          "Valid ID of business owner",
          "Community Tax Certificate (Cedula)",
          "Fire Safety Inspection Certificate (for some business types)",
          "Sanitary Permit (for food-related businesses)",
          "Application fee: ₱500-₱2,000"
      ],
      'Certificate of Good Moral': [
          "Barangay Clearance",
          "Valid government-issued ID",
          "Proof of Residency"
      ],
      'Barangay ID': [
          "Barangay Clearance",
          "Two proofs of residency (utility bills, lease contract, voter's cert or ID)",
          "Valid government-issued ID or Birth Certificate (PSA)",
          "Recent 2x2 ID photo",
          "For minors: parent/guardian consent and valid ID of parent"
      ]
  };

  if (certTypeDropdown) {
      certTypeDropdown.addEventListener('change', function() {
          const selectedCert = this.value;

          if (requirementsMap[selectedCert]) {
              requirementsList.innerHTML = '';
              requirementsMap[selectedCert].forEach(req => {
                  const li = document.createElement('li');
                  li.textContent = req;
                  requirementsList.appendChild(li);
              });
              requirementsContainer.style.display = 'block';
          } else {
              requirementsContainer.style.display = 'none';
          }
      });

      // Trigger change once on load to show requirements if a valid option is already selected
      certTypeDropdown.dispatchEvent(new Event('change'));
  }
});