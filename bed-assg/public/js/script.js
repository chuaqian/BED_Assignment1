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

    // Redirect to profile if user is already logged in
    const userIcon = document.querySelector('.fa-user');
    if (userIcon) {
        userIcon.addEventListener('click', function (event) {
            event.preventDefault();
            const user = JSON.parse(localStorage.getItem('user'));
            if (user) {
                window.location.href = 'profile.html';
            } else {
                window.location.href = 'login.html';
            }
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

// Login function
async function login(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Login result:', result); // Debugging
            alert('Login successful');
            localStorage.setItem('user', JSON.stringify(result.user));
            window.location.href = 'profile.html';
        } else {
            const result = await response.json();
            console.log('Login error:', result); // Debugging
            alert(result.message || 'Login failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error logging in. Please try again.');
    }
}

// Load profile details
function loadProfile() {
    const user = JSON.parse(localStorage.getItem('user'));
    console.log('Loaded user:', user); // Debugging

    if (user) {
        document.getElementById('name').textContent = `Hi, ${user.name}`;
        document.getElementById('birthday').textContent = `Birthday: ${new Date(user.birthday).toLocaleDateString()}`;
        document.getElementById('email').textContent = `Email: ${user.email}`;

        if (user.phoneNumber) {
            document.getElementById('phoneNumber').textContent = `Phone Number: ${user.phoneNumber}`;
            document.getElementById('phoneNumber').style.display = 'block';
        } else {
            document.getElementById('phoneNumber').style.display = 'none';
        }

        if (user.isProfessional) {
            console.log('User is professional. Displaying professional fields.'); // Debugging
            document.getElementById('occupation').textContent = `Occupation: ${user.occupation || 'Not specified'}`;
            document.getElementById('highestEducation').textContent = `Highest Level of Education: ${user.highestEducation || 'Not specified'}`;
            document.querySelectorAll('.professional-only').forEach(element => element.style.display = 'block');
        } else {
            console.log('User is not professional. Hiding professional fields.'); // Debugging
            document.querySelectorAll('.professional-only').forEach(element => element.style.display = 'none');
        }
    } else {
        alert('No user data found. Please log in.');
        window.location.href = 'login.html';
    }
}


// Load profile details for editing
function loadProfileForEditing() {
    const user = JSON.parse(localStorage.getItem('user'));
    console.log('Loaded user for editing:', user); // Debugging

    if (user) {
        document.getElementById('name').value = user.name;
        document.getElementById('birthday').value = user.birthday.split('T')[0]; // Split to get only the date part
        document.getElementById('email').value = user.email;
        document.getElementById('phoneNumber').value = user.phoneNumber || '';

        if (user.isProfessional) {
            console.log('User is professional. Displaying professional fields for editing.'); // Debugging
            document.querySelectorAll('.professional-only').forEach(element => element.style.display = 'block');
            document.getElementById('occupation').value = user.occupation || '';
            document.getElementById('highestEducation').value = user.highestEducation || '';
        } else {
            console.log('User is not professional. Hiding professional fields for editing.'); // Debugging
            document.querySelectorAll('.professional-only').forEach(element => element.style.display = 'none');
        }
    } else {
        alert('No user data found. Please log in.');
        window.location.href = 'login.html';
    }
}

// Edit profile details
function editProfileDetails() {
    window.location.href = 'update_profile.html';
}

// Save profile
async function saveProfile(event) {
    event.preventDefault();

    const user = JSON.parse(localStorage.getItem('user'));
    const updatedUser = {
        id: user.id,
        name: document.getElementById('name').value,
        birthday: document.getElementById('birthday').value,
        email: document.getElementById('email').value,
        phoneNumber: document.getElementById('phoneNumber').value,
        occupation: document.getElementById('occupation').value,
        highestEducation: document.getElementById('highestEducation').value,
        isProfessional: user.isProfessional
    };

    console.log('Updated user:', updatedUser); // Debugging

    try {
        const response = await fetch('http://localhost:3000/api/update_profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedUser),
        });

        if (response.ok) {
            const result = await response.json();
            alert('Profile updated successfully');
            localStorage.setItem('user', JSON.stringify(updatedUser));
            window.location.href = 'profile.html';
        } else {
            const result = await response.json();
            alert(result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error updating profile. Please try again.');
    }
}

// Log out function
function logOut() {
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// Forgot password
async function forgotPassword() {
    const email = document.getElementById('email').value;

    try {
        const response = await fetch('http://localhost:3000/api/forgot_password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });

        if (response.ok) {
            const result = await response.json();
            alert('Password reset email sent');
        } else {
            const result = await response.json();
            alert(result.message || 'Failed to send password reset email');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error sending password reset email. Please try again.');
    }

// Handle reset password form submission
document.addEventListener('DOMContentLoaded', function () {
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    resetPasswordForm.addEventListener('submit', handleResetPassword);
});

async function handleResetPassword(event) {
    event.preventDefault();

    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
        alert('Passwords do not match.');
        return;
    }

    const user = JSON.parse(localStorage.getItem('user'));
    const updatedUser = {
        id: user.id,
        password: newPassword,
        userType: user.type // Include the user type (user or professional)
    };

    try {
        const response = await fetch('http://localhost:3000/api/reset_password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedUser),
        });

        if (response.ok) {
            const result = await response.json();
            alert('Password reset successfully');
            localStorage.setItem('user', JSON.stringify(result.user));
            window.location.href = 'profile.html';
        } else {
            const result = await response.json();
            alert(result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error resetting password. Please try again.');
    }
}}