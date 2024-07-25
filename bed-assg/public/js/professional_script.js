document.getElementById('signupProfessionalForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phoneNumber = document.getElementById('phoneNumber').value;
    const birthday = document.getElementById('birthday').value;
    const occupation = document.getElementById('occupation').value;
    const highestEducation = document.getElementById('highestEducation').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    const professional = { name, email, phoneNumber, birthday, occupation, highestEducation, password };

    try {
        const response = await fetch('http://localhost:3001/api/professionals', { // Ensure the port is correct
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(professional)
        });

        if (!response.ok) {
            const result = await response.json();
            alert(`Error: ${result.error}`);
            return;
        }

        alert('Professional signed up successfully!');
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to sign up. Please try again later.');
    }
});
