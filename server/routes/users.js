const express = require('express');
const User = require('../models/User');
const { auth, isWorker, isVerified } = require('../middleware/auth');

const router = express.Router();

// Get all workers (for employers to browse)
router.get('/workers', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, skills, location } = req.query;
    
    const query = { userType: 'worker', isActive: true };
    
    if (skills) {
      query['profile.skills.name'] = { $in: skills.split(',') };
    }
    
    if (location) {
      query['profile.location'] = { $regex: location, $options: 'i' };
    }

    const workers = await User.find(query)
      .select('name profile rating wallet.balance')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ 'rating.average': -1 });

    const total = await User.countDocuments(query);

    res.json({
      workers,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Get workers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get worker profile by ID
router.get('/workers/:id', auth, async (req, res) => {
  try {
    const worker = await User.findOne({ 
      _id: req.params.id, 
      userType: 'worker',
      isActive: true 
    }).select('-password');

    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    res.json(worker);
  } catch (error) {
    console.error('Get worker error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user skills (for workers)
router.put('/skills', auth, isWorker, async (req, res) => {
  try {
    const { skills } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.profile.skills = skills;
    await user.save();

    res.json({
      message: 'Skills updated successfully',
      skills: user.profile.skills
    });
  } catch (error) {
    console.error('Update skills error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add skill certification
router.post('/certify', auth, isWorker, isVerified, async (req, res) => {
  try {
    const { skillName, certificateHash, blockchainTxId } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.addSkillCertification(skillName, certificateHash, blockchainTxId);
    await user.save();

    res.json({
      message: 'Skill certification added successfully',
      skill: user.profile.skills.find(s => s.name === skillName)
    });
  } catch (error) {
    console.error('Certify skill error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user wallet
router.get('/wallet', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('wallet');
    res.json(user.wallet);
  } catch (error) {
    console.error('Get wallet error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get wallet transactions
router.get('/wallet/transactions', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const user = await User.findById(req.user._id).select('wallet');
    
    const transactions = user.wallet.transactions
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice((page - 1) * limit, page * limit);

    res.json({
      transactions,
      totalPages: Math.ceil(user.wallet.transactions.length / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user experience
router.put('/experience', auth, isWorker, async (req, res) => {
  try {
    const { experience } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.profile.experience = experience;
    await user.save();

    res.json({
      message: 'Experience updated successfully',
      experience: user.profile.experience
    });
  } catch (error) {
    console.error('Update experience error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user education
router.put('/education', auth, isWorker, async (req, res) => {
  try {
    const { education } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.profile.education = education;
    await user.save();

    res.json({
      message: 'Education updated successfully',
      education: user.profile.education
    });
  } catch (error) {
    console.error('Update education error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Rate a user (for completed contracts)
router.post('/rate/:userId', auth, async (req, res) => {
  try {
    const { rating, review } = req.body;
    const { userId } = req.params;

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const userToRate = await User.findById(userId);
    if (!userToRate) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update rating
    const currentTotal = userToRate.rating.average * userToRate.rating.count;
    userToRate.rating.count += 1;
    userToRate.rating.average = (currentTotal + rating) / userToRate.rating.count;

    await userToRate.save();

    res.json({
      message: 'Rating submitted successfully',
      newRating: userToRate.rating
    });
  } catch (error) {
    console.error('Rate user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search workers by skills
router.get('/search/workers', auth, async (req, res) => {
  try {
    const { skills, location, minRating } = req.query;
    
    const query = { userType: 'worker', isActive: true };
    
    if (skills) {
      const skillArray = skills.split(',').map(s => s.trim());
      query['profile.skills.name'] = { $in: skillArray };
    }
    
    if (location) {
      query['profile.location'] = { $regex: location, $options: 'i' };
    }
    
    if (minRating) {
      query['rating.average'] = { $gte: parseFloat(minRating) };
    }

    const workers = await User.find(query)
      .select('name profile rating wallet.balance')
      .sort({ 'rating.average': -1 });

    res.json(workers);
  } catch (error) {
    console.error('Search workers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile (blockchain address and more)
router.put('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (req.body.blockchainAddress !== undefined) {
      user.blockchainAddress = req.body.blockchainAddress;
    }
    // Add more fields as needed
    await user.save();
    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user's profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 