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
            seminarDetail.innerHTML = `
                <div class="thumbnail">
                    <img src="${seminar.thumbnail}" alt="${seminar.title}">
                </div>
                <div class="details">
                    <h1>${seminar.title}</h1>
                    <p>${seminar.description}</p>
                    <div class="meta">
                        <span><b>${seminar.username}</b></span>
                        <span>${new Date(seminar.createdAt).toLocaleString()}</span>
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
