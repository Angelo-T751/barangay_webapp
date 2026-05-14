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
    e.preventDefault();
    const residentId = residentIdInput.value.trim();
    const password = passwordInput.value.trim();

    if (!residentId || !password) {
      showFieldError('❌ Please enter both Resident ID and password.');
      return;
    }

    const redirectUrl = redirectInput ? redirectInput.value : '../../templates/user/index.html';
    window.location.href = redirectUrl;
  });

  if (registerBtn) {
    registerBtn.addEventListener('click', () => {
      window.location.href = "../../templates/user/user_register.html";
    });
  }
})();