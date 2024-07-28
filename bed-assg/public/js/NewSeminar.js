// this script handles the submission of the seminar creation form
document.getElementById('seminarForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const user = JSON.parse(localStorage.getItem('user'));
    formData.append('user', JSON.stringify(user));
    try {
        const response = await fetch('/api/seminars', {
            method: 'POST',
            body: formData
        });
        if (response.ok) {
            alert('Seminar added successfully');
            location.href = '/ProfessionalSection.html';
        } else {
            const errorData = await response.json();
            alert('Failed to add seminar: ' + errorData.error);
        }
    } catch (error) {
        console.error('Error adding seminar:', error);
    }
});
