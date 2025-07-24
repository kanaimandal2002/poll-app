const express = require('express');
const router = express.Router();
const Poll = require('../models/Poll');
const { io } = require('../app');

// Create a new poll
router.post('/', async (req, res) => {
  try {
    const { question, options } = req.body;
    const poll = new Poll({
      question,
      options: options.map(option => ({ text: option }))
    });
    await poll.save();
    res.status(201).json(poll);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all polls
router.get('/', async (req, res) => {
  try {
    const polls = await Poll.find();
    res.json(polls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a specific poll
router.get('/:id', async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ message: 'Poll not found' });
    res.json(poll);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Vote on a poll
router.post('/:id/vote', async (req, res) => {
  try {
    const { optionId } = req.body;
    const poll = await Poll.findById(req.params.id);
    
    if (!poll) return res.status(404).json({ message: 'Poll not found' });
    
    const option = poll.options.id(optionId);
    if (!option) return res.status(404).json({ message: 'Option not found' });
    
    option.votes += 1;
    poll.totalVotes += 1;
    await poll.save();
    
    // Emit real-time update
    io.to(req.params.id).emit('pollUpdated', poll);
    
    res.json(poll);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
