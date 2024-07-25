document.addEventListener('DOMContentLoaded', () => {
    const addMoodButton = document.getElementById('add-mood-button');
    const moodPopup = document.getElementById('mood-popup');
    const closePopup = document.querySelector('.popup-content .close');
    const moodForm = document.getElementById('mood-form');
    const moodFaces = document.querySelectorAll('.mood-faces img');
    const moodTableBody = document.querySelector('#mood-table tbody');
    const moodChartCtx = document.getElementById('mood-chart').getContext('2d');

    let selectedMood = null;
    let moodData = [];
    let user = JSON.parse(localStorage.getItem('user')); // Get user details from local storage

    console.log('Loaded user:', user); // Debugging

    if (!user) {
        alert('User not logged in!');
        window.location.href = 'login.html'; // Redirect to login page if user is not logged in
    }

    const userId = user.id; // Extract user ID
    console.log('User ID:', userId); // Debugging

    const moodChart = new Chart(moodChartCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Mood Level',
                data: [],
                borderColor: '#B3C1F2',
                backgroundColor: '#B3C1F2',
                fill: false,
                tension: 0.1
            }]
        },
        options: {
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day'
                    },
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    beginAtZero: true,
                    max: 4,
                    ticks: {
                        stepSize: 1,
                        callback: function(value) {
                            const moods = ['Very Sad', 'Sad', 'Neutral', 'Happy', 'Very Happy'];
                            return moods[value];
                        }
                    },
                    title: {
                        display: true,
                        text: 'Mood Level'
                    }
                }
            }
        }
    });

    async function fetchMoods() {
        try {
            const response = await fetch(`http://localhost:3000/api/users/${userId}/moods`);
            if (!response.ok) {
                throw new Error('Failed to fetch moods');
            }
            const data = await response.json();
            moodData = data.map(entry => ({
                id: entry.id,
                date: new Date(entry.date),
                description: entry.description,
                moodIndex: entry.moodIndex
            }));
            moodData.sort((a, b) => a.date - b.date);
            updateMoodList();
            updateMoodChart();
        } catch (error) {
            console.error('Error fetching moods:', error);
        }
    }

    fetchMoods();

    addMoodButton.addEventListener('click', () => {
        moodPopup.classList.remove('hidden');
    });

    closePopup.addEventListener('click', () => {
        moodPopup.classList.add('hidden');
    });

    moodFaces.forEach(face => {
        face.addEventListener('click', () => {
            moodFaces.forEach(f => f.classList.remove('selected'));
            face.classList.add('selected');
            selectedMood = face.id;
        });
    });

    moodForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const dateInput = document.getElementById('mood-date').value;
        const description = document.getElementById('mood-description').value;

        if (!dateInput || !description || !selectedMood) {
            alert('Please complete all fields and select a mood.');
            return;
        }

        const moodIndex = ['very-sad', 'sad', 'neutral', 'happy', 'very-happy'].indexOf(selectedMood);
        const date = new Date(dateInput);

        if (isNaN(date.getTime())) {
            alert('Invalid date provided. Please enter a valid date.');
            return;
        }

        const moodPayload = { userId, date, description, moodIndex };

        if (editMode) {
            try {
                const response = await fetch(`http://localhost:3000/api/moods/${editMoodId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(moodPayload)
                });

                if (!response.ok) {
                    throw new Error('Failed to update mood: ' + response.statusText);
                }

                const updatedMood = await response.json();
                const index = moodData.findIndex(mood => mood.id === editMoodId);
                if (index !== -1) {
                    updatedMood.date = new Date(updatedMood.date);
                    if (isNaN(updatedMood.date.getTime())) {
                        console.error('Received an invalid date from server:', updatedMood.date);
                        throw new Error('Invalid date received from server update.');
                    }
                    moodData[index] = {
                        id: editMoodId,
                        userId,
                        date: updatedMood.date,
                        description: updatedMood.description,
                        moodIndex: updatedMood.moodIndex
                    };
                }
                moodData.sort((a, b) => a.date - b.date);
                updateMoodList();
                updateMoodChart();
            } catch (error) {
                console.error('Error updating mood:', error);
                alert('Failed to update mood. Please check your input and try again.');
            }
            editMode = false;
            editMoodId = null;
        } else {
            try {
                const response = await fetch('http://localhost:3000/api/moods', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(moodPayload)
                });

                if (!response.ok) {
                    throw new Error('Failed to add mood: ' + response.statusText);
                }

                const newMood = await response.json();
                newMood.date = new Date(newMood.date);
                moodData.push(newMood);
                moodData.sort((a, b) => a.date - b.date);
                console.log('New mood added:', newMood);
                updateMoodList();
                updateMoodChart();
            } catch (error) {
                console.error('Error adding mood:', error);
                alert('Failed to add mood. Please check your input and try again.');
            }
        }

        moodForm.reset();
        selectedMood = null;
        moodFaces.forEach(face => face.classList.remove('selected'));
        moodPopup.classList.add('hidden');
    });

    function updateMoodList() {
        moodTableBody.innerHTML = '';
        const moodDescriptions = ['Very Sad', 'Sad', 'Neutral', 'Happy', 'Very Happy'];

        moodData.forEach(({ id, date, description, moodIndex }) => {
            let formattedDate = 'Invalid Date';
            if (date instanceof Date && !isNaN(date)) {
                formattedDate = date.toISOString().split('T')[0];
            }

            const moodDescription = moodDescriptions[moodIndex];

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${formattedDate}</td>
                <td>${description}</td>
                <td>${moodDescription}</td>
                <td>
                    <button onclick="editMood(${id})">Edit</button>
                    <button onclick="deleteMood(${id})">Delete</button>
                </td>
            `;
            moodTableBody.appendChild(row);
        });
    }

    function updateMoodChart() {
        const dataPoints = moodData.map(entry => {
            if (!(entry.date instanceof Date) || isNaN(entry.date.getTime())) {
                console.error('Invalid date found in updateMoodChart:', entry.date);
                return null;
            }
            return {
                date: entry.date,
                moodIndex: entry.moodIndex
            };
        }).filter(entry => entry != null);

        const labels = dataPoints.map(entry => entry.date.toISOString().split('T')[0]);
        const dataset = {
            label: 'Mood Level',
            borderColor: '#B3C1F2',
            backgroundColor: '#B3C1F2',
            fill: false,
            tension: 0.1,
            data: dataPoints.map(entry => ({
                x: entry.date,
                y: entry.moodIndex
            }))
        };

        moodChart.data.labels = labels;
        moodChart.data.datasets = [dataset];
        moodChart.update();
    }

    let editMode = false;
    let editMoodId = null;

    window.editMood = function(id) {
        const mood = moodData.find(m => m.id === id);
        if (!mood) {
            alert('Mood not found');
            return;
        }

        document.getElementById('mood-date').value = mood.date.toISOString().split('T')[0];
        document.getElementById('mood-description').value = mood.description;
        moodFaces.forEach(face => face.classList.remove('selected'));
        document.getElementById(['very-sad', 'sad', 'neutral', 'happy', 'very-happy'][mood.moodIndex]).classList.add('selected');
        selectedMood = ['very-sad', 'sad', 'neutral', 'happy', 'very-happy'][mood.moodIndex];

        editMode = true;
        editMoodId = id;
        moodPopup.classList.remove('hidden');
    };

    window.deleteMood = async function(id) {
        try {
            const response = await fetch(`http://localhost:3000/api/moods/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete mood: ' + response.statusText);
            }

            moodData = moodData.filter(mood => mood.id !== id);
            updateMoodList();
            updateMoodChart();
        } catch (error) {
            console.error('Error deleting mood:', error);
            alert('Failed to delete mood. Please try again.');
        }
    };
});
