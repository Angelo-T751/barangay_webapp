(function() {
  const form = document.getElementById('registerForm');
  const loginBtn = document.getElementById('loginBtn');
  const redirectInput = document.getElementById('redirectAfterRegister');
  const successPopup = document.getElementById('successPopup');
  const closePopupBtn = document.getElementById('closePopupBtn');
  
  // Programmatically add placeholders to the inputs
  const houseInput = document.getElementById('house');
  const streetInput = document.getElementById('street');
  const firstNameInput = document.getElementById('firstName');
  const lastNameInput = document.getElementById('lastName');
  const emailInput = document.getElementById('email');
  
  if (houseInput) houseInput.placeholder = "e.g., 123 - A";
  if (streetInput) streetInput.placeholder = "e.g., 1st Ave";
  if (firstNameInput) firstNameInput.placeholder = "e.g., Juan";
  if (lastNameInput) lastNameInput.placeholder = "e.g., Dela Cruz";
  if (emailInput) emailInput.placeholder = "e.g., juandelacruz@gmail.com";

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

  function isValidName(name) {
    // Must start with a letter, allow letters/spaces/hyphens/dots, 2-50 chars
    if (!/^[a-zA-Z][a-zA-Z\s\-\.]{1,49}$/.test(name)) return false;
    // Reject common keyboard smashes
    if (/(qwer|wert|asdf|sdfg|dfgh|zxcv|xcvb|uiop|hjkl|poiu|lkjh|mnbv|fdsa|rewq)/i.test(name)) return false;
    // Reject 6+ consecutive consonants
    if (/[bcdfghjklmnpqrstvwxyz]{6,}/i.test(name)) return false;
    // Reject 5+ consecutive vowels
    if (/[aeiou]{5,}/i.test(name)) return false;
    // Reject 3+ repeating identical characters (e.g., AAA)
    if (/([a-zA-Z])\1{2,}/.test(name)) return false;
    
    return true;
  }

  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return false;

    const allowedDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
    const domain = email.split('@')[1].toLowerCase();
    return allowedDomains.includes(domain);
  }

  function isValidPhone(phone) {
    // Must start with +63 followed by exactly 10 digits (e.g. +639123456789)
    return /^\+63\d{10}$/.test(phone);
  }

  function isValidHouse(house) {
    return /^\d+\s*-\s*[a-zA-Z]$/.test(house);
  }

  function isValidStreet(street) {
    // Matches 1st Ave through 30th Ave
    return /^(1st|2nd|3rd|[4-9]th|1[0-9]th|20th|21st|22nd|23rd|2[4-9]th|30th)\s+ave\.?$/i.test(street);
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
    } else if (!isValidName(firstName)) {
      showFieldError('Enter a valid real name (no gibberish, 2-50 chars)', document.getElementById('firstName'));
      hasError = true;
    }
    if (!lastName) {
      showFieldError('Last name is required', document.getElementById('lastName'));
      hasError = true;
    } else if (!isValidName(lastName)) {
      showFieldError('Enter a valid real name (no gibberish, 2-50 chars)', document.getElementById('lastName'));
      hasError = true;
    }
    if (!email) {
      showFieldError('Email is required', document.getElementById('email'));
      hasError = true;
    } else if (!isValidEmail(email)) {
      showFieldError('Enter a valid email (e.g., @gmail.com, @yahoo.com)', document.getElementById('email'));
      hasError = true;
    }
    if (!phone) {
      showFieldError('Phone number is required', document.getElementById('phone'));
      hasError = true;
    } else if (!isValidPhone(phone)) {
      showFieldError('Phone number must start with +63 and have 10 digits', document.getElementById('phone'));
      hasError = true;
    }
    if (!house) {
      showFieldError('House number is required', document.getElementById('house'));
      hasError = true;
    } else if (!isValidHouse(house)) {
      showFieldError("Format must be like '123 - A'", document.getElementById('house'));
      hasError = true;
    }
    if (!street) {
      showFieldError('Street is required', document.getElementById('street'));
      hasError = true;
    } else if (!isValidStreet(street)) {
      showFieldError("Must be between '1st Ave' and '30th Ave'", document.getElementById('street'));
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

    // Submit data to the Flask backend without leaving the page
    const formData = new FormData(form);
    
    fetch('/register', {
      method: 'POST',
      body: formData,
      redirect: 'follow'
    })
    .then(response => {
      // If the backend redirected us to the login page, it means success!
      if (response.url.includes('login') || response.url.includes('user_login') || response.url.endsWith('/')) {
        if (successPopup) {
          successPopup.style.display = 'flex';
        } else {
          // Fallback if the html element is missing
          alert('Registration successful! Please check your email to verify your account.');
          window.location.href = redirectInput ? redirectInput.value : '../../templates/user/user_login.html';
        }
      } else {
        if (!response.ok) {
          alert('Server error! Check the terminal where your Flask app is running for the exact error.');
        } else {
          alert('Registration failed. The email might already be registered, or validation failed.');
        }
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('An error occurred connecting to the server. Make sure Flask is running.');
    });
  });

  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      const redirectUrl = redirectInput ? redirectInput.value : '../../templates/user/user_login.html';
      window.location.href = redirectUrl;
    });
  }

  if (closePopupBtn) {
    closePopupBtn.addEventListener('click', () => {
      const redirectUrl = redirectInput ? redirectInput.value : '../../templates/user/user_login.html';
      window.location.href = redirectUrl;
    });
  }
})();