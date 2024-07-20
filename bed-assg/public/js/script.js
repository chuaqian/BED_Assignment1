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

    // Update profile if on update profile page
    if (window.location.pathname.endsWith('update_profile.html')) {
        updateProfileForm();
    }

    // Attach login event listener
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', login);
    }

    // Attach password reset event listener
    const resetPasswordButton = document.getElementById('resetPasswordButton');
    if (resetPasswordButton) {
        resetPasswordButton.addEventListener('click', resetPassword);
    }
});

// Login function
async function login(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
            const result = await response.json();
            alert('Login successful');
            localStorage.setItem('user', JSON.stringify(result.user));
            window.location.href = 'profile.html';
        } else {
            const result = await response.json();
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

    if (user) {
        document.getElementById('name').textContent = `Hi, ${user.name}`;
        document.getElementById('birthday').textContent = `Birthday: ${new Date(user.birthday).toLocaleDateString()}`;
        document.getElementById('email').textContent = `Email: ${user.email}`;
        document.getElementById('gender').textContent = `Gender: ${user.gender || 'Not specified'}`;

        if (user.phoneNumber) {
            document.getElementById('phoneNumber').textContent = `Phone Number: ${user.phoneNumber}`;
            document.getElementById('phoneNumber').style.display = 'block';
        } else {
            document.getElementById('phoneNumber').style.display = 'none';
        }

        if (user.type === 'professional') {
            document.getElementById('occupation').textContent = `Occupation: ${user.occupation || 'Not specified'}`;
            document.getElementById('highestEducation').textContent = `Highest Level of Education: ${user.highestEducation || 'Not specified'}`;
            document.querySelectorAll('.professional-only').forEach(element => element.style.display = 'block');
        } else {
            document.querySelectorAll('.professional-only').forEach(element => element.style.display = 'none');
        }
    } else {
        alert('No user data found. Please log in.');
        window.location.href = 'login.html';
    }
}

// Update profile form with existing data
function updateProfileForm() {
    const user = JSON.parse(localStorage.getItem('user'));

    if (user) {
        document.getElementById('name').value = user.name;
        document.getElementById('birthday').value = user.birthday.split('T')[0];
        document.getElementById('email').value = user.email;
        document.getElementById('phoneNumber').value = user.phoneNumber || '';

        const genderRadios = document.getElementsByName('gender');
        for (const radio of genderRadios) {
            if (radio.value === user.gender) {
                radio.checked = true;
            }
        }

        if (user.type === 'professional') {
            document.getElementById('occupation').value = user.occupation || '';
            document.getElementById('highestEducation').value = user.highestEducation || '';
            document.querySelectorAll('.professional-only').forEach(element => element.style.display = 'block');
        } else {
            document.querySelectorAll('.professional-only').forEach(element => element.style.display = 'none');
        }
    } else {
        alert('No user data found. Please log in.');
        window.location.href = 'login.html';
    }

    document.getElementById('editProfileForm').addEventListener('submit', async function (event) {
        event.preventDefault();

        const updatedUser = {
            name: document.getElementById('name').value,
            birthday: document.getElementById('birthday').value,
            email: document.getElementById('email').value,
            gender: document.querySelector('input[name="gender"]:checked').value,
            phoneNumber: document.getElementById('phoneNumber').value,
        };

        if (user.type === 'professional') {
            updatedUser.occupation = document.getElementById('occupation').value;
            updatedUser.highestEducation = document.getElementById('highestEducation').value;
        }

        try {
            const response = await fetch('/api/update_profile', {
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
    });
}

// Log out function
function logOut() {
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// Password reset function
async function resetPassword() {
    const email = document.getElementById('email').value;

    try {
        const response = await fetch('/api/forgot_password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        const result = await response.json();
        if (response.status === 200) {
            alert(result.message);
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while processing your request. Please try again.');
    }
}

function editProfileDetails() {
    window.location.href = 'update_profile.html';
}
