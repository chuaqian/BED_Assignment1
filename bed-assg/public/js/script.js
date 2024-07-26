document.addEventListener('DOMContentLoaded', function () {
    // Password hidden toggle
    const togglePassword = document.getElementById('togglePassword');
    const passwordField = document.getElementById('password');

    if (togglePassword) {
        togglePassword.addEventListener('click', function () {
            const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordField.setAttribute('type', type);
            this.classList.toggle('fa-eye-slash');
        });
    }

    // Navbar toggle
    const menuIcon = document.getElementById('menu-icon');
    if (menuIcon) {
        menuIcon.addEventListener('click', function () {
            document.querySelector('.navbar').classList.toggle('active');
        });
    }

    // Load profile if on profile page
    if (window.location.pathname.endsWith('profile.html')) {
        loadProfile();
    }

    // Update profile form if on update profile page
    if (window.location.pathname.endsWith('update_profile.html')) {
        loadProfileForEditing();
        document.getElementById('editProfileForm').addEventListener('submit', saveProfile);
    }

    // Attach login event listener
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', login);
    }

    // Handle reset password form submission
    if (window.location.pathname.endsWith('reset_password.html')) {
        document.getElementById('resetPasswordForm').addEventListener('submit', handleResetPassword);
    }
});

