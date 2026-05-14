(function() {
  const form = document.getElementById('registerForm');
  const loginBtn = document.getElementById('loginBtn');
  const redirectInput = document.getElementById('redirectAfterRegister');

  function showFieldError(message, targetElement) {
    const existingError = targetElement.parentNode?.querySelector('.field-error-message');
    if (existingError) existingError.remove();

    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error-message';
    errorDiv.style.color = '#991b1b';
    errorDiv.style.fontSize = '0.7rem';
    errorDiv.style.marginTop = '0.2rem';
    errorDiv.innerText = message;

    if (targetElement.parentNode) {
      targetElement.parentNode.appendChild(errorDiv);
    }

    setTimeout(() => {
      if (errorDiv && errorDiv.remove) errorDiv.remove();
    }, 3500);
  }

  function isValidEmail(email) {
    return /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/.test(email);
  }

  function isValidPhone(phone) {
    return phone.length >= 7;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const house = document.getElementById('house').value.trim();
    const street = document.getElementById('street').value.trim();
    const barangay = document.getElementById('barangay').value.trim();
    const city = document.getElementById('city').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    let hasError = false;

    document.querySelectorAll('.field-error-message').forEach(el => el.remove());

    if (!firstName) {
      showFieldError('First name is required', document.getElementById('firstName'));
      hasError = true;
    }
    if (!lastName) {
      showFieldError('Last name is required', document.getElementById('lastName'));
      hasError = true;
    }
    if (!email) {
      showFieldError('Email is required', document.getElementById('email'));
      hasError = true;
    } else if (!isValidEmail(email)) {
      showFieldError('Enter a valid email address', document.getElementById('email'));
      hasError = true;
    }
    if (!phone) {
      showFieldError('Phone number is required', document.getElementById('phone'));
      hasError = true;
    } else if (!isValidPhone(phone)) {
      showFieldError('Phone number must be at least 7 digits', document.getElementById('phone'));
      hasError = true;
    }
    if (!house) {
      showFieldError('House number is required', document.getElementById('house'));
      hasError = true;
    }
    if (!street) {
      showFieldError('Street is required', document.getElementById('street'));
      hasError = true;
    }
    if (!password) {
      showFieldError('Password is required', document.getElementById('password'));
      hasError = true;
    }
    if (!confirmPassword) {
      showFieldError('Please confirm your password', document.getElementById('confirmPassword'));
      hasError = true;
    } else if (password !== confirmPassword) {
      showFieldError('Passwords do not match', document.getElementById('confirmPassword'));
      hasError = true;
    }

    if (hasError) return;

    const redirectUrl = redirectInput ? redirectInput.value : '../../templates/user/user_login.html';
    window.location.href = redirectUrl;
  });

  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      const redirectUrl = redirectInput ? redirectInput.value : '../../templates/user/user_login.html';
      window.location.href = redirectUrl;
    });
  }
})();