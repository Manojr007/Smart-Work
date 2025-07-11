const express = require('express');
const Contract = require('../models/Contract');
const Job = require('../models/Job');
const { auth, isEmployer, isWorker } = require('../middleware/auth');

const router = express.Router();

// Create contract from job application
router.post('/', auth, isEmployer, async (req, res) => {
  try {
    const { jobId, workerId, amount, duration, milestones } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (job.status !== 'open') {
      return res.status(400).json({ message: 'Job is not available for contract' });
    }

    // Check if worker has applied
    const application = job.applications.find(
      app => app.worker.toString() === workerId
    );
    if (!application) {
      return res.status(400).json({ message: 'Worker has not applied to this job' });
    }

    const contract = new Contract({
      job: jobId,
      employer: req.user._id,
      worker: workerId,
      terms: {
        amount,
        duration,
        milestones: milestones || []
      },
      startDate: new Date()
    });

    await contract.save();

    // Update job status and selected worker
    job.status = 'in-progress';
    job.selectedWorker = workerId;
    job.contract = contract._id;
    await job.save();

    res.status(201).json({
      message: 'Contract created successfully',
      contract
    });
  } catch (error) {
    console.error('Create contract error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user contracts
router.get('/my-contracts', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const query = {};
    if (req.user.userType === 'employer') {
      query.employer = req.user._id;
    } else {
      query.worker = req.user._id;
    }
    
    if (status) query.status = status;

    const contracts = await Contract.find(query)
      .populate('job', 'title description')
      .populate('employer', 'name profile.avatar')
      .populate('worker', 'name profile.avatar')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Contract.countDocuments(query);

    res.json({
      contracts,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Get contracts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get contract by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('job', 'title description')
      .populate('employer', 'name profile.avatar')
      .populate('worker', 'name profile.avatar')
      .populate('communication.sender', 'name profile.avatar');

    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    // Check if user is authorized to view this contract
    if (contract.employer._id.toString() !== req.user._id.toString() &&
        contract.worker._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(contract);
  } catch (error) {
    console.error('Get contract error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update contract status
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const contract = await Contract.findById(req.params.id);

    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    // Check authorization
    if (contract.employer.toString() !== req.user._id.toString() &&
        contract.worker.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    contract.status = status;
    
    if (status === 'completed') {
      contract.actualEndDate = new Date();
    }

    await contract.save();

    res.json({
      message: 'Contract status updated successfully',
      contract
    });
  } catch (error) {
    console.error('Update contract status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add milestone to contract
router.post('/:id/milestones', auth, isEmployer, async (req, res) => {
  try {
    const { title, description, amount, dueDate } = req.body;
    const contract = await Contract.findById(req.params.id);

    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    if (contract.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    contract.addMilestone(title, description, amount, dueDate);
    await contract.save();

    res.json({
      message: 'Milestone added successfully',
      milestones: contract.terms.milestones
    });
  } catch (error) {
    console.error('Add milestone error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update milestone status
router.put('/:id/milestones/:milestoneIndex', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const { milestoneIndex } = req.params;
    const contract = await Contract.findById(req.params.id);

    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    // Check authorization
    if (contract.employer.toString() !== req.user._id.toString() &&
        contract.worker.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    contract.updateMilestoneStatus(parseInt(milestoneIndex), status);
    await contract.save();

    res.json({
      message: 'Milestone status updated successfully',
      milestones: contract.terms.milestones
    });
  } catch (error) {
    console.error('Update milestone error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add deliverable
router.post('/:id/deliverables', auth, isWorker, async (req, res) => {
  try {
    const { title, description, fileUrl } = req.body;
    const contract = await Contract.findById(req.params.id);

    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    if (contract.worker.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    contract.addDeliverable(title, description, fileUrl);
    await contract.save();

    res.json({
      message: 'Deliverable added successfully',
      deliverables: contract.deliverables
    });
  } catch (error) {
    console.error('Add deliverable error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add communication message
router.post('/:id/messages', auth, async (req, res) => {
  try {
    const { message, type = 'text' } = req.body;
    const contract = await Contract.findById(req.params.id);

    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    // Check authorization
    if (contract.employer.toString() !== req.user._id.toString() &&
        contract.worker.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    contract.addMessage(req.user._id, message, type);
    await contract.save();

    res.json({
      message: 'Message sent successfully',
      communication: contract.communication
    });
  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Rate contract (both parties)
router.post('/:id/rate', auth, async (req, res) => {
  try {
    const { rating, review } = req.body;
    const contract = await Contract.findById(req.params.id);

    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    // Check authorization
    if (contract.employer.toString() !== req.user._id.toString() &&
        contract.worker.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Determine which rating to update
    if (contract.employer.toString() === req.user._id.toString()) {
      contract.ratings.employerRating = { rating, review, date: new Date() };
    } else {
      contract.ratings.workerRating = { rating, review, date: new Date() };
    }

    await contract.save();

    res.json({
      message: 'Rating submitted successfully',
      ratings: contract.ratings
    });
  } catch (error) {
    console.error('Rate contract error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Raise dispute
router.post('/:id/disputes', auth, async (req, res) => {
  try {
    const { reason, description } = req.body;
    const contract = await Contract.findById(req.params.id);

    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    // Check authorization
    if (contract.employer.toString() !== req.user._id.toString() &&
        contract.worker.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    contract.raiseDispute(req.user._id, reason, description);
    await contract.save();

    res.json({
      message: 'Dispute raised successfully',
      disputes: contract.disputes
    });
  } catch (error) {
    console.error('Raise dispute error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 