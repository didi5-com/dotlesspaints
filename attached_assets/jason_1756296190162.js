const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

// Initialize app
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/doctlesspaint', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define Comment Schema and Model
const commentSchema = new mongoose.Schema({
  itemId: String,
  text: String,
});

const Comment = mongoose.model('Comment', commentSchema);

// Routes
app.get('/api/comments', async (req, res) => {
  const comments = await Comment.find();
  res.json(comments);
});

app.post('/api/comments', async (req, res) => {
  const { itemId, text } = req.body;
  const comment = new Comment({ itemId, text });
  await comment.save();
  res.status(201).json({ message: 'Comment saved!' });
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
