const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['technology', 'design', 'marketing', 'writing', 'consulting', 'other']
  },
  skills: [{
    name: String,
    required: {
      type: Boolean,
      default: true
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert']
    }
  }],
  budget: {
    min: {
      type: Number,
      required: true
    },
    max: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'INR'
    }
  },
  duration: {
    type: String,
    required: true,
    enum: ['hourly', 'daily', 'weekly', 'monthly', 'project']
  },
  location: {
    type: String,
    default: 'remote'
  },
  requirements: {
    experience: {
      type: String,
      enum: ['entry', 'intermediate', 'senior', 'expert']
    },
    education: String,
    certifications: [String]
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'completed', 'cancelled'],
    default: 'open'
  },
  applications: [{
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    proposal: String,
    bidAmount: Number,
    estimatedDuration: String,
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
      default: 'pending'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    }
  }],
  selectedWorker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  contract: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contract'
  },
  tags: [String],
  attachments: [{
    filename: String,
    url: String,
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  applicationsCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for search functionality
jobSchema.index({ title: 'text', description: 'text', 'skills.name': 'text' });

// Method to add application
jobSchema.methods.addApplication = function(workerId, proposal, bidAmount, estimatedDuration) {
  this.applications.push({
    worker: workerId,
    proposal,
    bidAmount,
    estimatedDuration
  });
  this.applicationsCount = this.applications.length;
};

// Method to update application status
jobSchema.methods.updateApplicationStatus = function(workerId, status) {
  const application = this.applications.find(app => app.worker.toString() === workerId.toString());
  if (application) {
    application.status = status;
    if (status === 'accepted') {
      this.selectedWorker = workerId;
      this.status = 'in-progress';
    }
  }
};

// Method to increment views
jobSchema.methods.incrementViews = function() {
  this.views += 1;
};

module.exports = mongoose.model('Job', jobSchema); 