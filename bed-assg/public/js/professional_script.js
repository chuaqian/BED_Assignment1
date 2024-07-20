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
        const response = await fetch('http://localhost:3000/api/professionals', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(professional)
        });

        const result = await response.json();
        if (response.ok) {
            alert('Professional signed up successfully!');
            window.location.href = 'login.html';
        } else {
            alert(`Error: ${result.error}`);
        }
    } catch (error) {
        console.error('Error:', error);
    }
});
