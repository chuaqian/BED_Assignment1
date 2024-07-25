document.addEventListener('DOMContentLoaded', () => {
    loadComments();
    document.getElementById('searchInput').addEventListener('input', searchComments);
});

async function loadComments() {
    const response = await fetch('/api/comments?section=community');
    const data = await response.json();
    displayComments(data.comments);
}

function displayComments(comments) {
    const questionList = document.getElementById('questionList');
    questionList.innerHTML = '';
    comments.forEach(comment => {
        if (!comment.replyTo) {
            const questionItem = createCommentItem(comment);
            questionList.appendChild(questionItem);
        }
    });
}

function createCommentItem(comment) {
    const commentItem = document.createElement('div');
    commentItem.className = 'question-item';
    commentItem.innerHTML = `
        <div>
            <div class="username">${comment.username}</div>
            <div class="content">${comment.content}</div>
            <div class="reply-count">${comment.replyCount || 0} replies</div>
            <div class="comment-actions">
                <button class="like-button" onclick="likeComment(${comment.id})">Like ${comment.likes || 0}</button>
                <button class="dislike-button" onclick="dislikeComment(${comment.id})">Dislike ${comment.dislikes || 0}</button>
                <span>${new Date(comment.createdAt).toLocaleString()}</span>
                <button onclick="showReplyBox(${comment.id})">Reply</button>
                <button onclick="toggleReplies(${comment.id})" id="toggle-replies-${comment.id}">Show Replies</button>
                <button onclick="updateComment(${comment.id})">Update</button>
                <button onclick="deleteComment(${comment.id})">Delete</button>
            </div>
            <div class="replies hidden-replies" id="replies-${comment.id}"></div>
        </div>
    `;
    return commentItem;
}

async function postComment() {
    const username = document.getElementById('username').value;
    const content = document.getElementById('content').value;
    if (username && content) {
        await fetch('/api/comments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, content, section: 'community' })
        });
        document.getElementById('username').value = '';
        document.getElementById('content').value = '';
        loadComments();
    } else {
        alert('Please fill in both fields.');
    }
}

async function likeComment(id) {
    await fetch(`/api/comments/${id}/like`, { method: 'POST' });
    loadComments();
}

async function dislikeComment(id) {
    await fetch(`/api/comments/${id}/dislike`, { method: 'POST' });
    loadComments();
}

function showReplyBox(id) {
    const replyBox = document.createElement('div');
    replyBox.className = 'reply-box';
    replyBox.innerHTML = `
        <input type="text" placeholder="Username" id="reply-username-${id}">
        <textarea placeholder="Reply..." id="reply-content-${id}"></textarea>
        <button onclick="submitReply(${id})">Submit</button>
        <button onclick="cancelReply(${id})">Cancel</button>
    `;
    const repliesContainer = document.getElementById(`replies-${id}`);
    repliesContainer.appendChild(replyBox);
    repliesContainer.classList.remove('hidden-replies');
}

function cancelReply(id) {
    const replyBox = document.querySelector(`#replies-${id} .reply-box`);
    replyBox.remove();
}

async function submitReply(id) {
    const username = document.getElementById(`reply-username-${id}`).value;
    const content = document.getElementById(`reply-content-${id}`).value;
    if (username && content) {
        await fetch('/api/comments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, content, section: 'community', replyTo: id })
        });
        loadComments();
    } else {
        alert('Please fill in both fields.');
    }
}

async function deleteComment(id) {
    const response = await fetch(`/api/comments/${id}`, { method: 'DELETE' });
    if (response.ok) {
        loadComments();
    } else {
        alert('Failed to delete comment');
    }
}

async function updateComment(id) {
    const newContent = prompt('Enter new content:');
    if (newContent) {
        await fetch(`/api/comments/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content: newContent })
        });
        loadComments();
    }
}

async function searchComments() {
    const searchInput = document.getElementById('searchInput').value;
    let url = `/api/comments?section=community&search=${searchInput}`;
    const response = await fetch(url);
    const data = await response.json();
    displayComments(data.comments);
}

function toggleReplies(id) {
    const replies = document.getElementById(`replies-${id}`);
    const toggleButton = document.getElementById(`toggle-replies-${id}`);
    if (replies.classList.contains('hidden-replies')) {
        replies.classList.remove('hidden-replies');
        toggleButton.textContent = 'Hide Replies';
        loadReplies(id);
    } else {
        replies.classList.add('hidden-replies');
        toggleButton.textContent = 'Show Replies';
        replies.innerHTML = '';
    }
}

async function loadReplies(id) {
    const response = await fetch(`/api/comments?replyTo=${id}`);
    const data = await response.json();
    const repliesContainer = document.getElementById(`replies-${id}`);
    repliesContainer.innerHTML = '';
    data.comments.forEach(reply => {
        const replyItem = createReplyItem(reply);
        repliesContainer.appendChild(replyItem);
    });
}

function createReplyItem(reply) {
    const replyItem = document.createElement('div');
    replyItem.className = 'reply-item';
    replyItem.innerHTML = `
        <div class="username">Replying to ${reply.replyToUsername}: ${reply.username}</div>
        <div class="content">${reply.content}</div>
        <div class="comment-actions">
            <button class="like-button" onclick="likeComment(${reply.id})">Like ${reply.likes || 0}</button>
            <button class="dislike-button" onclick="dislikeComment(${reply.id})">Dislike ${reply.dislikes || 0}</button>
            <span>${new Date(reply.createdAt).toLocaleString()}</span>
            <button onclick="showReplyBox(${reply.id})">Reply</button>
            <button onclick="toggleReplies(${reply.id})" id="toggle-replies-${reply.id}">Show Replies</button>
            <button onclick="updateComment(${reply.id})">Update</button>
            <button onclick="deleteComment(${reply.id})">Delete</button>
        </div>
        <div class="replies hidden-replies" id="replies-${reply.id}"></div>
    `;
    return replyItem;
}
