document.addEventListener('DOMContentLoaded', () => {
    console.log("JavaScript loaded and ready to rock!");

    const API_URL = 'http://localhost:3306/api';
    const postsContainer = document.querySelector('#posts-container');

    // Function to persist posts in localStorage as backup
    const backupPostsLocally = (posts) => {
        localStorage.setItem('forumPosts', JSON.stringify(posts));
    };

    // Function to retrieve local backup
    const getLocalPosts = () => {
        const savedPosts = localStorage.getItem('forumPosts');
        return savedPosts ? JSON.parse(savedPosts) : [];
    };

    // Function to load posts from the server or local JSON file
    const loadPosts = () => {
        fetch('data.json')
            .then(response => response.json())
            .then(posts => {
                backupPostsLocally(posts);
                const currentUserId = localStorage.getItem('userId'); // Assuming you store user ID in localStorage
                const editedPosts = posts.map(post => ({
                    ...post,
                    comments: post.comments.map(comment => ({
                        ...comment,
                        actions: comment.userId === currentUserId ? `
                            <button class="edit-comment" data-id="${comment.id}">Edit</button>
                            <button class="delete-comment" data-id="${comment.id}">Delete</button>
                        ` : ''
                    }))
                }));
                displayPosts(editedPosts);
            })
            .catch(err => {
                console.error('Error:', err);
                const localPosts = getLocalPosts();
                if (localPosts.length) {
                    displayPosts(localPosts);
                }
            });
    };

    // Function to check if the user is the post author
    const isPostAuthor = (post) => {
        const currentUserId = localStorage.getItem('userId');
        return post.userId === currentUserId;
    };

    // Function to display posts
    const displayPosts = (posts) => {
        postsContainer.innerHTML = '';
        posts.forEach(post => {
            const postSection = document.createElement('section');
            postSection.classList.add('post');
            postSection.setAttribute('data-id', post.id);

            const postActions = isPostAuthor(post) ? `
                <div class="post-actions">
                    <button class="edit-post" data-id="${post.id}">Edit Post</button>
                    <button class="delete-post" data-id="${post.id}">Delete Post</button>
                </div>
            ` : '';

            postSection.innerHTML = `
                <h3>${post.title}</h3>
                <p>${post.content}</p>
                ${postActions}
                <form class="comment-form">
                    <textarea placeholder="Leave a comment..." required></textarea>
                    <button type="submit">Comment</button>
                </form>
                <div class="comments-container" id="comments-container-${post.id}">
                    ${post.comments.map(comment => `
                        <div class="comment">
                            <p><strong>${comment.user}</strong>: ${comment.content}</p>
                            ${comment.actions || ''}
                            <div class="replies-container">
                                ${comment.replies.map(reply => `
                                    <div class="reply">
                                        <p><strong>${reply.user}</strong>: ${reply.content}</p>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            postsContainer.appendChild(postSection);
        });

        // Add event listeners for post actions
        document.querySelectorAll('.edit-post').forEach(button => {
            button.addEventListener('click', (e) => {
                const postId = e.target.dataset.id;
                const post = e.target.closest('.post');
                const content = post.querySelector('p').innerText;
                const newContent = prompt('Edit your post:', content);
                if (newContent) {
                    fetch(`${API_URL}/posts/${postId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                        body: JSON.stringify({ content: newContent })
                    })
                    .then(() => loadPosts())
                    .catch(err => console.error('Error:', err));
                }
            });
        });

        document.querySelectorAll('.delete-post').forEach(button => {
            button.addEventListener('click', (e) => {
                if (confirm('Are you sure you want to delete this post?')) {
                    const postId = e.target.dataset.id;
                    fetch(`${API_URL}/posts/${postId}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    })
                    .then(() => loadPosts())
                    .catch(err => console.error('Error:', err));
                }
            });
        });
    };

    // Load posts when the page loads
    loadPosts();

    // Handle Forum post submission
    const forumForm = document.querySelector('#forum-form');
    if (forumForm) {
        forumForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const postContent = forumForm.querySelector('textarea').value;
            fetch(`${API_URL}/posts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: postContent })
            })
            .then(response => response.json())
            .then(post => {
                loadPosts(); // Reload posts to include the new post
                forumForm.reset();
            })
            .catch(err => console.error('Error:', err));
        });
    }

    // Handle Reply and Comment submission
    postsContainer.addEventListener('submit', (event) => {
        if (event.target.classList.contains('comment-form')) {
            event.preventDefault();
            const postSection = event.target.closest('.post');
            const postId = postSection.getAttribute('data-id');
            const commentContent = event.target.querySelector('textarea').value;
            fetch(`${API_URL}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ postId, content: commentContent })
            })
            .then(response => response.json())
            .then(post => {
                loadPosts(); // Reload posts to include the new comment
                event.target.reset();
            })
            .catch(err => console.error('Error:', err));
        }
    });

    // Add event listeners for comment edit and delete
    postsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('edit-comment')) {
            const commentId = e.target.dataset.id;
            const comment = e.target.closest('.comment');
            const content = comment.querySelector('p').innerText;
            const newContent = prompt('Edit your comment:', content);
            if (newContent) {
                fetch(`${API_URL}/comments/${commentId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ content: newContent })
                })
                .then(() => loadPosts())
                .catch(err => console.error('Error:', err));
            }
        }

        if (e.target.classList.contains('delete-comment')) {
            if (confirm('Are you sure you want to delete this comment?')) {
                const commentId = e.target.dataset.id;
                fetch(`${API_URL}/comments/${commentId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                })
                .then(() => loadPosts())
                .catch(err => console.error('Error:', err));
            }
        }
    });
});
