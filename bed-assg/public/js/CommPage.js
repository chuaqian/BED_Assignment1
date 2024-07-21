document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed");

    const communityBtn = document.getElementById('communityBtn');
    const professionalBtn = document.getElementById('professionalBtn');
    const communitySection = document.getElementById('communitySection');
    const professionalSection = document.getElementById('professionalSection');
    const communitySearch = document.getElementById('communitySearchUsername');
    const professionalSearch = document.getElementById('professionalSearchUsername');

    communityBtn.addEventListener('click', () => {
        communityBtn.classList.add('active');
        professionalBtn.classList.remove('active');
        communitySection.classList.remove('hidden');
        professionalSection.classList.add('hidden');
        loadComments('community');
    });

    professionalBtn.addEventListener('click', () => {
        professionalBtn.classList.add('active');
        communityBtn.classList.remove('active');
        professionalSection.classList.remove('hidden');
        communitySection.classList.add('hidden');
        loadComments('professional');
    });

    communitySearch.addEventListener('input', () => {
        searchComments('community');
    });

    professionalSearch.addEventListener('input', () => {
        searchComments('professional');
    });

    loadComments('community');
    loadComments('professional');
});

async function loadComments(section) {
    console.log(`Loading comments for section: ${section}`);
    try {
        const response = await fetch(`/api/comments?section=${section}`);
        const data = await response.json();
        console.log('Comments data:', data);
        const commentList = document.getElementById(`${section}Comments`);
        commentList.innerHTML = '';
        data.comments.forEach(comment => {
            if (!comment.replyTo) {
                const commentElement = createCommentElement(comment, section);
                commentList.appendChild(commentElement);
            }
        });
    } catch (error) {
        console.error('Error loading comments:', error);
    }
}

function createCommentElement(comment, section) {
    const commentElement = document.createElement('div');
    commentElement.classList.add('comment');
    commentElement.dataset.id = comment.id;
    commentElement.innerHTML = `
        <div class="comment-content">
            <p class="username">${comment.username}</p>
            <p class="content">${comment.content}</p>
        </div>
        <div class="comment-actions">
            <button class="reply-button" onclick="replyToComment(${comment.id}, '${section}')">Reply</button>
            <button class="update-button" onclick="updateComment(${comment.id}, '${section}')">Update</button>
            <button class="delete-button" onclick="deleteComment(${comment.id}, '${section}')">Delete</button>
        </div>
        <div class="replies hidden-replies"></div>
        <button class="toggle-replies-button" onclick="toggleReplies(${comment.id}, '${section}')">Show Replies</button>
    `;
    loadReplies(comment.id, section, commentElement.querySelector('.replies'));
    return commentElement;
}

async function loadReplies(parentId, section, container) {
    console.log(`Loading replies for comment ID: ${parentId}`);
    try {
        const response = await fetch(`/api/comments?replyTo=${parentId}`);
        const data = await response.json();
        console.log('Replies data:', data);
        data.comments.forEach(reply => {
            const replyElement = createCommentElement(reply, section);
            container.appendChild(replyElement);
        });
    } catch (error) {
        console.error('Error loading replies:', error);
    }
}

async function addComment(section) {
    const usernameInput = document.getElementById(`${section}Username`);
    const contentInput = document.getElementById(`${section}Content`);
    const username = usernameInput.value;
    const content = contentInput.value;
    if (username && content) {
        try {
            await fetch('/api/comments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, content, section })
            });
            usernameInput.value = '';
            contentInput.value = '';
            loadComments(section);
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    } else {
        alert('Please fill in both fields.');
    }
}

async function deleteComment(id, section) {
    try {
        await fetch(`/api/comments/${id}`, {
            method: 'DELETE'
        });
        loadComments(section);
    } catch (error) {
        console.error('Error deleting comment:', error);
    }
}

async function updateComment(id, section) {
    const content = prompt('Enter new content:');
    if (content) {
        try {
            await fetch(`/api/comments/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content })
            });
            loadComments(section);
        } catch (error) {
            console.error('Error updating comment:', error);
        }
    }
}

async function searchComments(section) {
    const searchInput = document.getElementById(`${section}SearchUsername}`).value;
    try {
        const response = await fetch(`/api/comments/search?username=${searchInput}`);
        const data = await response.json();
        console.log('Search results:', data);
        const commentList = document.getElementById(`${section}Comments`);
        commentList.innerHTML = '';
        data.comments.forEach(comment => {
            if (!comment.replyTo) {
                const commentElement = createCommentElement(comment, section);
                commentList.appendChild(commentElement);
            }
        });
    } catch (error) {
        console.error('Error searching comments:', error);
    }
}

function replyToComment(id, section) {
    const commentElement = document.querySelector(`.comment[data-id="${id}"]`);
    const replyBox = document.createElement('div');
    replyBox.classList.add('reply-box');
    replyBox.innerHTML = `
        <input type="text" placeholder="Username">
        <textarea placeholder="Reply..."></textarea>
        <button class="save-button" onclick="submitReply(${id}, '${section}')">Submit</button>
        <button class="cancel-button" onclick="cancelReply(${id}, '${section}')">Cancel</button>
    `;
    commentElement.appendChild(replyBox);
}

function cancelReply(id, section) {
    const replyBox = document.querySelector(`.comment[data-id="${id}"] .reply-box`);
    replyBox.remove();
}

async function submitReply(id, section) {
    const replyBox = document.querySelector(`.comment[data-id="${id}"] .reply-box`);
    const username = replyBox.querySelector('input').value;
    const content = replyBox.querySelector('textarea').value;
    if (username && content) {
        try {
            await fetch('/api/comments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, content, section, replyTo: id })
            });
            loadComments(section);
        } catch (error) {
            console.error('Error submitting reply:', error);
        }
    } else {
        alert('Please fill in both fields.');
    }
}

function toggleReplies(id, section) {
    const commentElement = document.querySelector(`.comment[data-id="${id}"]`);
    const repliesContainer = commentElement.querySelector('.replies');
    const toggleButton = commentElement.querySelector('.toggle-replies-button');

    if (repliesContainer.classList.contains('hidden-replies')) {
        repliesContainer.classList.remove('hidden-replies');
        toggleButton.textContent = 'Hide Replies';
    } else {
        repliesContainer.classList.add('hidden-replies');
        toggleButton.textContent = 'Show Replies';
    }
}
