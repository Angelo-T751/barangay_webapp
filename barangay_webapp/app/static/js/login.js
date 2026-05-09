document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passInput = document.getElementById('password');
    const togglePass = document.getElementById('togglePass');
    const errorMsg = document.getElementById('errorMessage');
    const loginCard = document.getElementById('loginCard');

    const ADMIN_EMAIL = "admin@ains.com";
    const ADMIN_PASS = "admin123";

    // Toggle Password Visibility
    togglePass.addEventListener('click', () => {
        const isPass = passInput.type === 'password';
        passInput.type = isPass ? 'text' : 'password';
        togglePass.className = isPass ? 'fa-regular fa-eye toggle-eye' : 'fa-regular fa-eye-slash toggle-eye';
    });

    // Reset icons visibility function
    function resetIcons() {
        document.querySelectorAll('.field-icon').forEach(icon => {
            icon.style.opacity = '1';
        });
    }

    // Input listeners for icon behavior and error clearing
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', function() {
            const icon = this.previousElementSibling;
            if(icon && icon.classList.contains('field-icon')) {
                icon.style.opacity = this.value.length > 0 ? '0' : '1';
            }
            errorMsg.style.display = 'none';
            loginCard.classList.remove('shake');
        });
    });

    // Form Submission Logic
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // --- ADDED: Check localStorage for registered admins ---
        let registeredAdmins = JSON.parse(localStorage.getItem('registeredAdmins')) || [];
        const isRegistered = registeredAdmins.find(a => a.email === emailInput.value && a.password === passInput.value);

        if ((emailInput.value === ADMIN_EMAIL && passInput.value === ADMIN_PASS) || isRegistered) {
            document.body.style.transition = "opacity 0.5s ease";
            document.body.style.opacity = '0';
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 500);
        } else {
            // Trigger Shake and Error
            loginCard.classList.remove('shake');
            void loginCard.offsetWidth; 
            loginCard.classList.add('shake');
            errorMsg.style.display = 'block';

            // Clear fields
            emailInput.value = "";
            passInput.value = "";
            resetIcons();
        }
    });
});