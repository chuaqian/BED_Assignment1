document.addEventListener('DOMContentLoaded', function () {
    const togglePassword = document.getElementById('togglePassword');
    const passwordField = document.getElementById('password');

    togglePassword.addEventListener('click', function () {
        // Toggle the type attribute
        const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordField.setAttribute('type', type);
        
        // Toggle the eye slash icon
        this.classList.toggle('fa-eye-slash');
    });
});

async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            window.location.href = 'profile.html'; // Redirect to profile page
        } else {
            throw new Error('Login failed');
        }
    } catch (error) {
        console.error('Error logging in:', error);
        alert('Login failed. Please check your credentials.');
    }
}

// Navbar toggle
document.getElementById('menu-icon').addEventListener('click', function() {
    document.querySelector('.navbar').classList.toggle('active');
});


// Function to reset password
async function resetPassword() {
    const email = document.getElementById('email').value;
    const birthday = document.getElementById('birthday').value;
    const newPassword = prompt('Enter your new password:');

    try {
        const response = await fetch('/api/reset-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, birthday, newPassword }),
        });

        if (response.ok) {
            const data = await response.json();
            alert(data.message); // Display success message
        } else {
            const errorData = await response.json();
            alert(errorData.error || 'Failed to reset password'); // Display error message
        }
    } catch (error) {
        console.error('Error resetting password:', error);
        alert('Error resetting password');
    }
}
