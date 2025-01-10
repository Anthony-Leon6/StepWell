const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.use(bodyParser.json());

const loadData = () => JSON.parse(fs.readFileSync('data.json'));

const saveData = (data) => fs.writeFileSync('data.json', JSON.stringify(data, null, 2));

// Get all posts
app.get('/api/posts', (req, res) => {
    const data = loadData();
    res.json(data.posts);
});

// Add a new post
app.post('/api/posts', (req, res) => {
    const data = loadData();
    const newPost = {
        id: data.posts.length + 1,
        title: req.body.title,
        content: req.body.content,
        user: req.body.user || 'Anonymous',
        comments: []
    };
    data.posts.push(newPost);
    saveData(data);
    res.status(201).json(newPost);
});

// Add a new comment to a post
app.post('/api/comments', (req, res) => {
    const data = loadData();
    const post = data.posts.find(p => p.id === req.body.postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    
    const newComment = {
        id: post.comments.length + 1,
        content: req.body.content,
        user: req.body.user || 'Anonymous',
        replies: []
    };
    post.comments.push(newComment);
    saveData(data);
    res.status(201).json(newComment);
});

// Add a reply to a comment
app.post('/api/replies', (req, res) => {
    const data = loadData();
    const post = data.posts.find(p => p.id === req.body.postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    
    const comment = post.comments.find(c => c.id === req.body.commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    
    const newReply = {
        id: comment.replies.length + 1,
        content: req.body.content,
        user: req.body.user || 'Anonymous'
    };
    comment.replies.push(newReply);
    saveData(data);
    res.status(201).json(newReply);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
