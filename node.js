app.post('/comments', (req, res) => {
    const { postId, content } = req.body;
    const userId = req.user.id; // Assume user is authenticated and ID is available
    const query = 'CALL SaveComment(?, ?, ?)';
    db.query(query, [userId, postId, content], (err, results) => {
        if (err) {
            console.error('Error saving comment:', err);
            res.status(500).send('Server error');
            return;
        }
        res.status(201).json({ id: results[0][0].id, content, timestamp: new Date() });
    });
});
