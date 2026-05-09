document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registerForm');
    const regCard = document.getElementById('regCard');
    const successCard = document.getElementById('successCard');

    // 1. Password Visibility Toggle Logic
    document.querySelectorAll('.toggle-pass').forEach(eye => {
        eye.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const input = document.getElementById(targetId);
            const isPass = input.type === 'password';
            
            input.type = isPass ? 'text' : 'password';
            
            // Toggle FontAwesome classes
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    });

    // 2. Helper function to trigger errors
    function triggerError(id) {
        const errorSpan = document.getElementById(`err-${id}`);
        const inputField = document.getElementById(id);
        
        if (errorSpan) errorSpan.style.display = 'block';
        if (inputField) inputField.classList.add('input-error');
    }

    // 3. Form Submission Logic
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        let isValid = true;
        
        // Reset previous errors
        document.querySelectorAll('.error-note').forEach(el => el.style.display = 'none');
        document.querySelectorAll('input').forEach(input => input.classList.remove('input-error'));
        
        const fields = ['firstName', 'lastName', 'email', 'password', 'confirmPass', 'adminCode'];
        const vals = {};
        fields.forEach(f => vals[f] = document.getElementById(f).value);

        // Validation Rules
        if(!vals.firstName) { triggerError('firstName'); isValid = false; }
        if(!vals.lastName) { triggerError('lastName'); isValid = false; }
        if(!vals.email.includes('@')) { triggerError('email'); isValid = false; }
        if(vals.password.length < 6) { triggerError('password'); isValid = false; }
        if(vals.password !== vals.confirmPass || !vals.confirmPass) { triggerError('confirmPass'); isValid = false; }
        if(!vals.adminCode) { triggerError('adminCode'); isValid = false; }

        if(isValid) {
            // Success: Hide form and show success state
            regCard.style.display = 'none';
            successCard.style.display = 'block';
        } else {
            // Failure: Trigger Shake animation defined in CSS
            regCard.classList.remove('shake');
            void regCard.offsetWidth; // Force reflow
            regCard.classList.add('shake');
            
            // Clear password fields for security
            document.getElementById('password').value = "";
            document.getElementById('confirmPass').value = "";
        }
    });

    // 4. Real-time validation cleanup
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', function() {
            this.classList.remove('input-error');
            const errorSpan = document.getElementById(`err-${this.id}`);
            if(errorSpan) errorSpan.style.display = 'none';
        });
    });
});