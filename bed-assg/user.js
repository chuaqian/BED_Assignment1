document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('signupUserForm');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        try {
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const phoneNumber = document.getElementById('phoneNumber').value;
            const birthday = document.getElementById('birthday').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (password !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }

            const newUser = {
                name,
                email,
                phoneNumber,
                birthday,
                password
            };

            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newUser)
            });

            if (response.ok) {
                alert('User created successfully!');
                form.reset();
            } else {
                const error = await response.json();
                alert(`Error: ${error.message}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        }
    });
});
