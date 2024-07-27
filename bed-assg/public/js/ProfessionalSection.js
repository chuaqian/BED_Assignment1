document.addEventListener('DOMContentLoaded', () => {
    loadSeminars();
    document.getElementById('searchInput').addEventListener('input', searchSeminars);

    // Show create seminar button only if the user is a professional
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.isProfessional) {
        document.querySelector('.create-seminar-button').style.display = 'block';
    } else {
        document.querySelector('.create-seminar-button').style.display = 'none';
    }
});

async function loadSeminars() {
    const response = await fetch('/api/seminars');
    const data = await response.json();
    displaySeminars(data.seminars);
}

function displaySeminars(seminars) {
    const seminarList = document.getElementById('seminarList');
    seminarList.innerHTML = '';
    seminars.forEach(seminar => {
        const seminarItem = document.createElement('div');
        seminarItem.className = 'seminar-item';
        seminarItem.innerHTML = `
            <div class="thumbnail">
                <img src="${seminar.thumbnail}" alt="${seminar.title}">
            </div>
            <div class="details">
                <h3>${seminar.title}</h3>
                <p>${seminar.description}</p>
                <span>By ${seminar.username} on ${new Date(seminar.createdAt).toLocaleString()}</span>
            </div>
        `;
        seminarItem.addEventListener('click', () => {
            window.location.href = `/seminar/${seminar.id}`;
        });
        seminarList.appendChild(seminarItem);
    });
}

async function searchSeminars() {
    const searchInput = document.getElementById('searchInput').value;
    let url = `/api/seminars?search=${searchInput}`;
    const response = await fetch(url);
    const data = await response.json();
    displaySeminars(data.seminars);
}
