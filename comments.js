document.addEventListener('DOMContentLoaded', () => {
    console.log("JavaScript loaded and ready to rock!");

    const API_URL = 'http://localhost:3000/api';
    const displayContainer = document.querySelector('#display-container');
    const postForm = document.querySelector('#post-form');

    // Function to load posts from the local JSON file
    const loadPosts = () => {
        fetch(`${API_URL}/posts`)
            .then(response => response.json())
            .then(posts => {
                displayPosts(posts);
            })
            .catch(err => console.error('Error fetching data:', err));
    };

    // Function to display posts, comments, and replies
    const displayPosts = (posts) => {
        displayContainer.innerHTML = '';
        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.classList.add('post');
            postElement.innerHTML = `
                <h3>${post.title}</h3>
                <p>${post.content}</p>
                <p><strong>Posted by:</strong> ${post.user}</p>
                <form class="comment-form" data-post-id="${post.id}">
                    <textarea placeholder="Leave a comment..." required></textarea>
                    <button type="submit">Comment</button>
                </form>
                <div class="comments-container" id="comments-container-${post.id}">
                    ${post.comments.map(comment => `
                        <div class="comment">
                            <img src="default_profile_pic.png" alt="Profile Picture" class="comment-profile-pic">
                            <p><strong>${comment.user}</strong>: ${comment.content}</p>
                            <form class="reply-form" data-post-id="${post.id}" data-comment-id="${comment.id}">
                                <textarea placeholder="Leave a reply..." required></textarea>
                                <button type="submit">Reply</button>
                            </form>
                            <div class="replies-container">
                                ${comment.replies.map(reply => `
                                    <div class="reply comment-reply">
                                        <img src="default_profile_pic.png" alt="Profile Picture" class="comment-profile-pic">
                                        <p><strong>${reply.user}</strong>: ${reply.content}</p>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            displayContainer.appendChild(postElement);
        });

        // Add event listeners for comment and reply submissions
        document.querySelectorAll('.comment-form').forEach(form => {
            form.addEventListener('submit', (event) => {
                event.preventDefault();
                const postId = event.target.dataset.postId;
                const content = event.target.querySelector('textarea').value;
                fetch(`${API_URL}/comments`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ postId, content, user: 'Anonymous' })
                })
                .then(() => loadPosts())
                .catch(err => console.error('Error posting comment:', err));
            });
        });

        document.querySelectorAll('.reply-form').forEach(form => {
            form.addEventListener('submit', (event) => {
                event.preventDefault();
                const postId = event.target.dataset.postId;
                const commentId = event.target.dataset.commentId;
                const content = event.target.querySelector('textarea').value;
                fetch(`${API_URL}/replies`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ postId, commentId, content, user: 'Anonymous' })
                })
                .then(() => loadPosts())
                .catch(err => console.error('Error posting reply:', err));
            });
        });
    };

    // Handle Forum post submission
    postForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const title = document.querySelector('#post-title').value;
        const content = document.querySelector('#post-content').value;
        fetch(`${API_URL}/posts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content, user: 'Anonymous' })
        })
        .then(() => {
            loadPosts(); // Reload posts to include the new post
            postForm.reset();
        })
        .catch(err => console.error('Error posting:', err));
    });

    // Load posts when the page loads
    loadPosts();
});
