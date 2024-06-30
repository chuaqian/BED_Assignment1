const option1 = document.getElementById("button1");
const option2 = document.getElementById("button2");
const option3 = document.getElementById("button3");
const option4 = document.getElementById("button4");
const pageId = document.body.getAttribute('data-page-id');
const Content = document.getElementById("content");
const SubmitButton = document.getElementById("Submit");
let score = 0;

document.getElementById('menu-icon').addEventListener('click', function() {
    document.querySelector('.navbar').classList.toggle('active');
});

const correctAnswers = {
    1: "button1",
    2: "button2",
    3: "button2",
    4: "button3",
    5: "button1",
    6: "button1"
};

document.addEventListener("DOMContentLoaded", function () {
    const sessionStorageKey = (buttonId) => `buttonShowState_${pageId}_${buttonId}`;

    const retrieveButtonState = (buttonId) => {
        return sessionStorage.getItem(sessionStorageKey(buttonId)) === "true";
    };

    const initializeButtonState = (button, buttonId) => {
        const isButtonShown = retrieveButtonState(buttonId);
        if (isButtonShown) {
            button.classList.add("selected");
        }
    };

    const updateButtonState = (button, buttonId) => {
        button.addEventListener("click", function () {
            const isSelected = button.classList.contains("selected");

            if (isSelected) {
                button.classList.remove("selected");
                sessionStorage.setItem(sessionStorageKey(buttonId), "false");
            } else {
                document.querySelectorAll(`#${button.parentNode.id} button`).forEach(btn => {
                    btn.classList.remove("selected");
                    sessionStorage.setItem(sessionStorageKey(btn.id), "false");
                });

                button.classList.add("selected");
                sessionStorage.setItem(sessionStorageKey(buttonId), "true");
            }
        });
    };

    const answerButtons = document.querySelectorAll(".content button");

    answerButtons.forEach((button, index) => {
        initializeButtonState(button, `button${index + 1}`);
        updateButtonState(button, `button${index + 1}`);
    });
});

SubmitButton.addEventListener('click', function (event) {
    event.preventDefault();

    for (const [questionId, correctButtonId] of Object.entries(correctAnswers)) {
        const selectedButton = document.querySelector(`[data-question-id="${questionId}"] .selected`);
        if (selectedButton && selectedButton.id === correctButtonId) {
            score += 1;
        }
    }

    const Username = "JamesBond";
    const Score = score

    fetch('/submit-score', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ Username, Score })
    })
        .then(response => response.json())
        .then(data => {
            alert('Score submitted successfully!');
        })
        .catch(error => {
            console.error('Error submitting score:', error);
            alert('Error submitting score.');
        });

    fetch('/get-highest-score')
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                document.getElementById('score').innerText = data.error;
            } else {
                document.getElementById('score').innerText = `Username: ${data.username}, Score: ${data.score}`;
            }
        })
        .catch(error => {
            console.error('Error fetching score:', error);
            document.getElementById('score').innerText = 'Error fetching score.';
        });
});