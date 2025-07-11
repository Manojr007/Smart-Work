const express = require('express');
const Job = require('../models/Job');
const User = require('../models/User');
const { auth, isEmployer, isWorker } = require('../middleware/auth');

const router = express.Router();

// Create a new job (employers only)
router.post('/', auth, isEmployer, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      skills,
      budget,
      duration,
      location,
      requirements,
      tags
    } = req.body;

    const job = new Job({
      title,
      description,
      employer: req.user._id,
      category,
      skills,
      budget,
      duration,
      location,
      requirements,
      tags
    });

    await job.save();

    res.status(201).json({
      message: 'Job posted successfully',
      job
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all jobs with filters
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      skills,
      minBudget,
      maxBudget,
      location,
      status = 'open'
    } = req.query;

    const query = { isActive: true };
    
    if (status) query.status = status;
    if (category) query.category = category;
    if (location) query.location = { $regex: location, $options: 'i' };
    if (minBudget) query['budget.min'] = { $gte: parseInt(minBudget) };
    if (maxBudget) query['budget.max'] = { $lte: parseInt(maxBudget) };
    if (skills) {
      const skillArray = skills.split(',').map(s => s.trim());
      query['skills.name'] = { $in: skillArray };
    }

    const jobs = await Job.find(query)
      .populate('employer', 'name profile.avatar rating')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Job.countDocuments(query);

    res.json({
      jobs,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get job by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('employer', 'name profile.avatar rating')
      .populate('applications.worker', 'name profile.avatar rating');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Increment views
    job.incrementViews();
    await job.save();

    res.json(job);
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Apply to a job (workers only)
router.post('/:id/apply', auth, isWorker, async (req, res) => {
  try {
    const { proposal, bidAmount, estimatedDuration } = req.body;
    const jobId = req.params.id;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.status !== 'open') {
      return res.status(400).json({ message: 'Job is not open for applications' });
    }

    // Check if already applied
    const alreadyApplied = job.applications.find(
      app => app.worker.toString() === req.user._id.toString()
    );
    if (alreadyApplied) {
      return res.status(400).json({ message: 'You have already applied to this job' });
    }

    job.addApplication(req.user._id, proposal, bidAmount, estimatedDuration);
    await job.save();

    res.json({
      message: 'Application submitted successfully',
      application: job.applications[job.applications.length - 1]
    });
  } catch (error) {
    console.error('Apply to job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get jobs posted by employer
router.get('/employer/my-jobs', auth, isEmployer, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const query = { employer: req.user._id };
    if (status) query.status = status;

    const jobs = await Job.find(query)
      .populate('selectedWorker', 'name profile.avatar')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Job.countDocuments(query);

    res.json({
      jobs,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Get employer jobs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get jobs applied by worker
router.get('/worker/my-applications', auth, isWorker, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const jobs = await Job.find({
      'applications.worker': req.user._id
    })
      .populate('employer', 'name profile.avatar')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    // Filter applications for current user
    const jobsWithUserApplications = jobs.map(job => {
      const userApplication = job.applications.find(
        app => app.worker.toString() === req.user._id.toString()
      );
      return {
        ...job.toObject(),
        userApplication
      };
    });

    const total = await Job.countDocuments({
      'applications.worker': req.user._id
    });

    res.json({
      jobs: jobsWithUserApplications,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Get worker applications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update application status (employer only)
router.put('/:jobId/applications/:workerId', auth, isEmployer, async (req, res) => {
  try {
    const { status } = req.body;
    const { jobId, workerId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    job.updateApplicationStatus(workerId, status);
    await job.save();

    res.json({
      message: 'Application status updated successfully',
      job
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// AI-based job recommendations for workers
router.get('/recommendations', auth, isWorker, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const userSkills = user.profile.skills.map(skill => skill.name.toLowerCase());

    // Find jobs that match user skills
    const jobs = await Job.find({
      isActive: true,
      status: 'open',
      'skills.name': { $in: userSkills }
    })
      .populate('employer', 'name profile.avatar rating')
      .limit(10)
      .sort({ createdAt: -1 });

    // Calculate similarity score for each job
    const jobsWithScore = jobs.map(job => {
      const jobSkills = job.skills.map(skill => skill.name.toLowerCase());
      const commonSkills = userSkills.filter(skill => jobSkills.includes(skill));
      const similarityScore = commonSkills.length / Math.max(userSkills.length, jobSkills.length);
      
      return {
        ...job.toObject(),
        similarityScore: Math.round(similarityScore * 100)
      };
    });

    // Sort by similarity score
    jobsWithScore.sort((a, b) => b.similarityScore - a.similarityScore);

    res.json(jobsWithScore);
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search jobs by text
router.get('/search/text', auth, async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const jobs = await Job.find({
      $text: { $search: q },
      isActive: true,
      status: 'open'
    })
      .populate('employer', 'name profile.avatar rating')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ score: { $meta: 'textScore' } });

    const total = await Job.countDocuments({
      $text: { $search: q },
      isActive: true,
      status: 'open'
    });

    res.json({
      jobs,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Search jobs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update job (employer only)
router.put('/:id', auth, isEmployer, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (job.status !== 'open') {
      return res.status(400).json({ message: 'Cannot update job that is not open' });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('employer', 'name profile.avatar');

    res.json({
      message: 'Job updated successfully',
      job: updatedJob
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete job (employer only)
router.delete('/:id', auth, isEmployer, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (job.status !== 'open') {
      return res.status(400).json({ message: 'Cannot delete job that is not open' });
    }

    await Job.findByIdAndDelete(req.params.id);

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 