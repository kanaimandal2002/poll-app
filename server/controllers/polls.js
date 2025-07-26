const Poll = require('../models/Poll');
const { io } = require('../server');

exports.createPoll = async (req, res) => {
  try {
    const { question, options } = req.body;
    
    const poll = new Poll({
      question,
      options: options.map(option => ({ text: option }))
    });

    await poll.save();
    res.status(201).json(poll);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getPoll = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }
    res.json(poll);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.vote = async (req, res) => {
  try {
    const { optionId, userIP } = req.body;
    const poll = await Poll.findById(req.params.id);
    
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    // Check if user already voted
    if (poll.userIPs.includes(userIP)) {
      return res.status(400).json({ error: 'You have already voted' });
    }

    const option = poll.options.id(optionId);
    if (!option) {
      return res.status(404).json({ error: 'Option not found' });
    }

    option.votes += 1;
    poll.totalVotes += 1;
    poll.userIPs.push(userIP);
    
    await poll.save();
    
    // Emit real-time update to all clients viewing this poll
    io.to(req.params.id).emit('updatePoll', poll);
    
    res.json(poll);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
