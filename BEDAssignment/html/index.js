const option1 = document.getElementById("button1");
const option2 = document.getElementById("button2");
const option3 = document.getElementById("button3");
const option4 = document.getElementById("button4");
const Content = document.getElementById("content");
const SubmitButton = document.getElementById("Submit");
const UserScore = document.getElementById('text1')
const HighScoreUser = document.getElementById("text2");
const HighScore = document.getElementById("text3");
var timer = document.getElementById("timer");
const quizButton = document.getElementById("quiz");
let timerInterval;
const backButton = document.getElementById("Back");
const linkContainer = document.getElementById('link');
const CorrectButtons = [];
const pageId = document.body.getAttribute('data-page-id');

document.getElementById('menu-icon').addEventListener('click', function () {
    document.querySelector('.navbar').classList.toggle('active');
});

document.addEventListener('DOMContentLoaded', function () {

    const timerElement = document.getElementById('timer');
    let timerInterval;

    const startTimer = (duration) => {
        const startTime = Date.now();
        localStorage.setItem('startTime', startTime);
        localStorage.setItem('duration', duration);

        let totalSeconds = duration;

        const updateTimerDisplay = () => {
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            timerElement.innerHTML = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        };

        if (timerInterval) {
            clearInterval(timerInterval);
        }

        timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            totalSeconds = duration - elapsed;

            if (totalSeconds <= 0) {
                clearInterval(timerInterval);
                timerElement.innerHTML = "Time is up";
                localStorage.setItem('timeIsUp', 'true');
                disableBackButton();
            } else {
                updateTimerDisplay();
            }
        }, 1000);

        updateTimerDisplay();
    };

    const disableBackButton = () => {
        const backButton = document.getElementById('Back');
        if (backButton) {
            backButton.classList.add('disabled');
            backButton.disabled = true;
        }
    };

    const backButton = document.getElementById('Back');
    if (backButton) {
        backButton.addEventListener('click', function () {
            if (!backButton.disabled) {
                window.location.href = 'Quiz15.html';
            }
        });
    }

    const quizButton = document.getElementById('quiz');
    if (quizButton) {
        quizButton.addEventListener('click', function () {
            localStorage.removeItem('remainingTime');
            localStorage.removeItem('timeIsUp');
            startTimer(900);
        });
    }

    if (localStorage.getItem('timeIsUp') === 'true') {
        timerElement.innerHTML = "Time is up";
        disableBackButton();
    } else {
        const startTime = localStorage.getItem('startTime');
        const duration = parseInt(localStorage.getItem('duration'));

        if (startTime && duration) {
            const elapsed = Math.floor((Date.now() - parseInt(startTime)) / 1000);
            const remainingTime = duration - elapsed;

            if (remainingTime > 0) {
                startTimer(remainingTime);
            } else {
                timerElement.innerHTML = "Time is up";
                localStorage.setItem('timeIsUp', 'true');
                disableBackButton();
            }
        }
    }

    window.addEventListener('beforeunload', function () {
        if (timerInterval) {
            clearInterval(timerInterval);
        }
    });
});

const correctAnswers = {
    "1": "button1",
    "2": "button2",
    "3": "button2",
    "4": "button3",
    "5": "button1",
    "6": "button1",
    "7": "button3",
    "8": "button2",
    "9": "button2",
    "10": "button1",
    "11": "button1",
    "12": "button4",
    "13": "button2",
    "14": "button3",
    "15": "button2"
};

document.addEventListener("DOMContentLoaded", function () {

    // Log the retrieved pageId for debugging
    console.log(`Page ID: ${pageId}`);

    // Function to construct the session storage key
    const sessionStorageKey = (buttonId) => {
        const key = `buttonShowState_${pageId}_${buttonId}`;
        console.log('Generated Key for button', buttonId, ':', key); // Log the key
        return key;
    };

    // Function to retrieve button state from localStorage
    const retrieveButtonState = (buttonId) => {
        return localStorage.getItem(sessionStorageKey(buttonId)) === "true";
    };

    // Initialize the button state based on localStorage
    const initializeButtonState = (button, buttonId) => {
        const isButtonShown = retrieveButtonState(buttonId);
        if (isButtonShown) {
            button.classList.add("selected");
        }
    };

    const saveButtonStateToLocalStorage = (questionId, buttonId) => {
        console.log(`Saving button state: Question ${questionId}, Button ${buttonId}`);
        localStorage.setItem(`selectedButton_${questionId}`, buttonId);
    };

    const updateButtonState = (button, buttonId, questionId) => {
        button.addEventListener("click", function () {
            const isSelected = button.classList.contains("selected");
    
            if (!isSelected) {
                // Deselect all buttons in the current question
                document.querySelectorAll(`[data-question-id="${questionId}"] .button1, [data-question-id="${questionId}"] .button2, [data-question-id="${questionId}"] .button3, [data-question-id="${questionId}"] .button4`).forEach(btn => {
                    btn.classList.remove("selected");
                    localStorage.removeItem(`selectedButton_${questionId}`);
                });
                // Select the clicked button
                button.classList.add("selected");
                saveButtonStateToLocalStorage(questionId, buttonId);
            } else {
                // If the button is already selected, deselect it
                button.classList.remove("selected");
                localStorage.removeItem(`selectedButton_${questionId}`);
            }
        });
    };
    
    // Initialize and update button states for each button
    const answerButtons = document.querySelectorAll(".AnswerButtons button");
    
    answerButtons.forEach((button) => {
        const buttonId = button.id;
        const questionId = button.closest('[data-question-id]').getAttribute('data-question-id');
        if (buttonId && questionId) {
            initializeButtonState(button, buttonId);
            updateButtonState(button, buttonId, questionId);
        } else {
            console.error('Button ID or Question ID is missing:', button);
        }
    });

    if (SubmitButton) {
        SubmitButton.addEventListener('click', function (event) {
            event.preventDefault();

            console.log('localStorage items:', localStorage);

            let score = 0;

            for (const [questionId, correctButtonId] of Object.entries(correctAnswers)) {
                const selectedButtonId = localStorage.getItem(`selectedButton_${questionId}`);
                console.log(`Selected Button for Question ${questionId}: ${selectedButtonId}`);
                
                // Check if the selected button matches the correct answer
                if (selectedButtonId === correctButtonId) {
                    score += 1;
                }
            }

            const finalScoreMessage = `Final Score: ${score}`;
            console.log(finalScoreMessage);
            localStorage.setItem('Score', score);

            fetch('http://localhost:3000/Submit.html', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ Username: "Module", Score: score })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.message === 'Score submitted successfully') {
                        window.location.href = 'results.html';
                    } else {
                        alert('Error submitting score.');
                    }
                })
                .catch(error => {
                    console.error('Error submitting score:', error);
                    alert('Error submitting score.');
                });
        });
    }

    if (window.location.pathname === '/results.html') {
        const Score = localStorage.getItem('Score');
        UserScore.innerText = `Your score: ${Score}`;


        document.getElementById('ToHighScore').addEventListener('click', function () {
            window.location.href = '/LeaderboardScreen.html';
        });
    }

    if (quizButton) {
        quizButton.addEventListener('click', function () {
            localStorage.removeItem('remainingTime');
            localStorage.removeItem('timeIsUp');

            const keysToRemove = Object.keys(localStorage).filter(key => key.startsWith('buttonShowState_'));
            keysToRemove.forEach(key => localStorage.removeItem(key));

            window.location.href = 'Quiz1.html';
        });
    }

    if (window.location.pathname === "/LeaderboardScreen.html") {
        fetch('/api/results')
            .then(response => response.json())
            .then(data => {
                const leaderboardBody = document.getElementById('leaderboard-body');
                leaderboardBody.innerHTML = '';

                data.slice(0, 10).forEach((entry, index) => {
                    const progressPercentage = (entry.Score / 15) * 100;

                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${entry.Username}</td>
                        <td>${entry.Score}</td>
                        <td>
                            <div class="progress-bar-container">
                                <div class="progress-bar" style="width: ${progressPercentage}%;"></div>
                            </div>
                        </td>
                    `;
                    leaderboardBody.appendChild(row);
                });
            })
            .catch(error => console.error('Error fetching leaderboard data:', error));
    }
});