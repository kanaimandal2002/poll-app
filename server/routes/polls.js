const express = require('express');
const router = express.Router();
const Poll = require('../models/Poll');

module.exports = function(io) {
  // Create a new poll
  router.post('/', async (req, res) => {
    try {
      const { question, options } = req.body;
      const poll = new Poll({ question, options });
      await poll.save();
      io.emit('new-poll', poll);
      res.status(201).json(poll);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get all polls
  router.get('/', async (req, res) => {
    try {
      const polls = await Poll.find();
      res.json(polls);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vote on a poll
  router.post('/:id/vote', async (req, res) => {
    try {
      const { optionId } = req.body;
      const poll = await Poll.findById(req.params.id);
      
      if (!poll) {
        return res.status(404).json({ error: 'Poll not found' });
      }
      
      const option = poll.options.id(optionId);
      if (!option) {
        return res.status(404).json({ error: 'Option not found' });
      }
      
      option.votes += 1;
      await poll.save();
      
      io.emit('update-poll', poll);
      res.json(poll);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  return router;
};
