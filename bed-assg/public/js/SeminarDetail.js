document.addEventListener('DOMContentLoaded', () => {
    const seminarId = window.location.pathname.split('/').pop();
    loadSeminarDetail(seminarId);
});

async function loadSeminarDetail(id) {
    try {
        const response = await fetch(`/api/seminars/${id}`);
        if (response.ok) {
            const seminar = await response.json();
            const seminarDetail = document.getElementById('seminarDetail');
            const user = JSON.parse(localStorage.getItem('user'));

            const isCreator = seminar.userId === user.id && user.isProfessional;
            const joinButton = `<button onclick="joinSeminar(${seminar.id})" id="join-button">Join Seminar</button>`;
            const editDeleteButtons = `
                <button onclick="editSeminar(${seminar.id})">Edit</button>
                <button onclick="deleteSeminar(${seminar.id})">Delete</button>
            `;

            seminarDetail.innerHTML = `
                <div class="seminar-detail-container">
                    <div class="thumbnail">
                        <img src="${seminar.thumbnail}" alt="${seminar.title}">
                    </div>
                    <div class="details">
                        <h1>${seminar.title}</h1>
                        <p>${seminar.description}</p>
                        <div class="meta">
                            <span><b>${seminar.username}</b></span>
                            <span>${new Date(seminar.createdAt).toLocaleString()}</span>
                            <span>Participants: ${seminar.participantCount || 0}</span>
                        </div>
                        ${isCreator ? editDeleteButtons : joinButton}
                    </div>
                </div>
            `;
        } else {
            document.getElementById('seminarDetail').innerHTML = '<p>Failed to load seminar details.</p>';
        }
    } catch (error) {
        console.error('Error fetching seminar details:', error);
        document.getElementById('seminarDetail').innerHTML = '<p>Failed to load seminar details.</p>';
    }
}

async function editSeminar(id) {
    const newTitle = prompt('Enter new title:');
    const newDescription = prompt('Enter new description:');
    const newThumbnail = prompt('Enter new thumbnail URL:');

    if (newTitle && newDescription && newThumbnail) {
        try {
            const response = await fetch(`/api/seminars/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title: newTitle, description: newDescription, thumbnail: newThumbnail })
            });
            if (response.ok) {
                alert('Seminar updated successfully');
                loadSeminarDetail(id);
            } else {
                alert('Failed to update seminar');
            }
        } catch (error) {
            console.error('Error updating seminar:', error);
        }
    }
}

async function deleteSeminar(id) {
    const confirmDelete = confirm('Are you sure you want to delete this seminar?');
    if (confirmDelete) {
        try {
            const response = await fetch(`/api/seminars/${id}`, { method: 'DELETE' });
            if (response.ok) {
                alert('Seminar deleted successfully');
                window.location.href = '/ProfessionalSection.html';
            } else {
                alert('Failed to delete seminar');
            }
        } catch (error) {
            console.error('Error deleting seminar:', error);
        }
    }
}

async function joinSeminar(id) {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        try {
            const response = await fetch(`/api/seminars/${id}/join`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ user: user })
            });
            if (response.ok) {
                alert('Successfully joined the seminar');
                document.getElementById('join-button').disabled = true;
                loadSeminarDetail(id);
            } else {
                const result = await response.json();
                alert(result.error);
            }
        } catch (error) {
            console.error('Error joining seminar:', error);
        }
    } else {
        alert('You must be logged in to join a seminar');
    }
}
