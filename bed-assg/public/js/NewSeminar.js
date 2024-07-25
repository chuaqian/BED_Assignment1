document.getElementById('seminarForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const response = await fetch('/api/seminars', {
        method: 'POST',
        body: formData
    });
    if (response.ok) {
        alert('Seminar added successfully');
        location.href = '/ProfessionalSection.html';
    } else {
        alert('Failed to add seminar');
    }
});
