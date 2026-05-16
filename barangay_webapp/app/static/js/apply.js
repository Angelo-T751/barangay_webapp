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
      selectedFile = fileInput.files[0];
      updateFilePreview(selectedFile.name);
      const existingError = document.querySelector('.file-upload-error');
      if (existingError) existingError.remove();
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

    if (!selectedFile) {
      e.preventDefault();
      showFileError('Please upload a required document (PDF or image, max 25MB).');
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
});