// professional_script.js (example)
document.addEventListener('DOMContentLoaded', function () {
    const signupForm = document.getElementById('signupProfessionalForm');

    signupForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const formData = new FormData(signupForm);
        const data = Object.fromEntries(formData.entries());

        if (data.password !== data.confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        // Remove confirmPassword from the data before sending to the server
        delete data.confirmPassword;

        try {
            const response = await fetch('/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Professional created:', result);
                alert('Professional signed up successfully!');
            } else {
                const errorData = await response.json();
                console.error('Error:', errorData);
                alert('Error signing up professional.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error signing up professional.');
        }
    });
});
