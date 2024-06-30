document.addEventListener("DOMContentLoaded", () => {
    loadComments('community');
    loadComments('professional');
    document.getElementById('communityBtn').addEventListener('click', () => switchSection('community'));
    document.getElementById('professionalBtn').addEventListener('click', () => switchSection('professional'));
});

function switchSection(section) {
    document.querySelector('.header .active').classList.remove('active');
    document.getElementById(`${section}Btn`).classList.add('active');
    document.querySelector('.comments-section:not(.hidden)').classList.add('hidden');
    document.getElementById(`${section}Section`).classList.remove('hidden');
}

async function loadComments(section) {
    const response = await fetch(`/api/comments?section=${section}`);
    const data = await response.json();
    const commentsList = document.getElementById(`${section}Comments`);
    commentsList.innerHTML = '';
    data.comments.forEach(comment => {
        const commentElement = createCommentElement(comment, section);
        commentsList.appendChild(commentElement);
    });
}

async function addComment(section, replyTo = null) {
    const usernameInput = replyTo ? document.querySelector(`.comment[data-id="${replyTo}"] .reply-username`) : document.getElementById(`${section}Username`);
    const contentInput = replyTo ? document.querySelector(`.comment[data-id="${replyTo}"] .reply-content`) : document.getElementById(`${section}Content`);
    const username = usernameInput.value;
    let content = contentInput.value;

    if (username.trim() === '' || content.trim() === '') {
        alert('Please fill in both fields.');
        return;
    }

    if (replyTo) {
        const replyingToUsername = document.querySelector(`.comment[data-id="${replyTo}"] .username`).textContent;
        content = `Replying to ${replyingToUsername}: ${content}`;
    }

    const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, content, section })
    });

    if (response.ok) {
        loadComments(section);
        if (replyTo) {
            document.querySelector(`.comment[data-id="${replyTo}"] .reply-box`).remove();
        } else {
            usernameInput.value = '';
            contentInput.value = '';
        }
    } else {
        alert('Failed to add comment.');
    }
}

async function updateComment(id, section) {
    const commentElement = document.querySelector(`.comment[data-id="${id}"]`);
    const contentElement = commentElement.querySelector('.content');
    const originalContent = contentElement.textContent;

    contentElement.innerHTML = `<textarea class="update-textarea">${originalContent}</textarea>`;
    commentElement.querySelector('.update-button').style.display = 'none';
    commentElement.querySelector('.delete-button').style.display = 'none';

    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.classList.add('save-button');
    saveButton.addEventListener('click', async () => {
        const newContent = contentElement.querySelector('.update-textarea').value;
        const response = await fetch(`/api/comments/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: newContent })
        });

        if (response.ok) {
            loadComments(section);
        } else {
            alert('Failed to update comment.');
        }
    });

    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.classList.add('cancel-button');
    cancelButton.addEventListener('click', () => {
        contentElement.textContent = originalContent;
        saveButton.remove();
        cancelButton.remove();
        commentElement.querySelector('.update-button').style.display = '';
        commentElement.querySelector('.delete-button').style.display = '';
    });

    commentElement.querySelector('.comment-actions').appendChild(saveButton);
    commentElement.querySelector('.comment-actions').appendChild(cancelButton);
}

async function deleteComment(id, section) {
    const response = await fetch(`/api/comments/${id}`, { method: 'DELETE' });
    if (response.ok) {
        loadComments(section);
    } else {
        alert('Failed to delete comment.');
    }
}

async function searchComments(section) {
    const searchInput = document.getElementById(`${section}SearchUsername`);
    const username = searchInput.value;

    if (username.trim() === '') {
        alert('Please enter a username to search.');
        return;
    }

    const response = await fetch(`/api/comments/search?username=${username}`);
    const data = await response.json();
    const commentsList = document.getElementById(`${section}Comments`);
    commentsList.innerHTML = '';

    if (data.comments.length === 0) {
        commentsList.innerHTML = '<p>No comments found for this username.</p>';
    } else {
        data.comments.forEach(comment => {
            const commentElement = createCommentElement(comment, section);
            commentsList.appendChild(commentElement);
        });
    }
}

function createCommentElement(comment, section) {
    const commentElement = document.createElement('div');
    commentElement.classList.add('comment');
    commentElement.setAttribute('data-id', comment.id);
    commentElement.innerHTML = `
        <div class="comment-content">
            <span class="username">${comment.username}</span>
            <p class="content">${comment.content}</p>
        </div>
        <div class="comment-actions">
            <button class="reply-button" onclick="showReplyBox(${comment.id}, '${comment.username}', '${section}')">Reply</button>
            <button class="update-button" onclick="updateComment(${comment.id}, '${section}')">Update</button>
            <button class="delete-button" onclick="deleteComment(${comment.id}, '${section}')">Delete</button>
        </div>
        <div class="replies"></div>
    `;
    return commentElement;
}

function showReplyBox(commentId, username, section) {
    const commentElement = document.querySelector(`.comment[data-id="${commentId}"]`);
    const replyBox = document.createElement('div');
    replyBox.classList.add('reply-box');
    replyBox.innerHTML = `
        <span>Replying to ${username}</span>
        <input type="text" placeholder="Username" class="reply-username">
        <textarea placeholder="Add a reply..." class="reply-content"></textarea>
        <button onclick="addComment('${section}', ${commentId})">Post Reply</button>
    `;
    commentElement.appendChild(replyBox);
}
