(function() {
  const form = document.getElementById('userLoginForm');
  const registerBtn = document.getElementById('registerBtn');
  const residentIdInput = document.getElementById('residentId');
  const passwordInput = document.getElementById('password');
  const redirectInput = document.getElementById('redirectAfterLogin');

  function showFieldError(message) {
    const existingError = document.querySelector('.field-error-message');
    if (existingError) existingError.remove();

    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error-message';
    errorDiv.style.color = '#991b1b';
    errorDiv.style.fontSize = '0.75rem';
    errorDiv.style.marginTop = '-0.75rem';
    errorDiv.style.marginBottom = '0.75rem';
    errorDiv.style.textAlign = 'left';
    errorDiv.innerText = message;
    
    const lastInput = passwordInput.closest('.form-group');
    if (lastInput && lastInput.parentNode) {
      lastInput.parentNode.insertBefore(errorDiv, lastInput.nextSibling);
    }
    
    setTimeout(() => {
      if (errorDiv && errorDiv.remove) errorDiv.remove();
    }, 3000);
  }

  form.addEventListener('submit', (e) => {
    const residentId = residentIdInput.value.trim();
    const password = passwordInput.value.trim();

    if (!residentId || !password) {
      e.preventDefault(); // Only prevent form submission if fields are empty
      showFieldError('❌ Please enter both Resident ID and password.');
      return;
    }

    // Ensure the form submits via POST to hide credentials from the URL
    form.method = 'POST';
    form.action = '/login';
    
    // Ensure the input names match what the Flask backend expects
    residentIdInput.name = 'identifier';
    passwordInput.name = 'password';
  });

  if (registerBtn) {
    registerBtn.addEventListener('click', () => {
      window.location.href = "/register";
    });
  }
})();