const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  terms: {
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'INR'
    },
    duration: String,
    milestones: [{
      title: String,
      description: String,
      amount: Number,
      dueDate: Date,
      status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed', 'approved'],
        default: 'pending'
      }
    }]
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'completed', 'cancelled', 'disputed'],
    default: 'draft'
  },
  startDate: Date,
  endDate: Date,
  actualEndDate: Date,
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'completed'],
    default: 'pending'
  },
  totalPaid: {
    type: Number,
    default: 0
  },
  payments: [{
    amount: Number,
    date: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['milestone', 'final', 'bonus']
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending'
    },
    transactionId: String,
    description: String
  }],
  deliverables: [{
    title: String,
    description: String,
    fileUrl: String,
    submittedAt: Date,
    approvedAt: Date,
    status: {
      type: String,
      enum: ['pending', 'submitted', 'approved', 'rejected'],
      default: 'pending'
    },
    feedback: String
  }],
  communication: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['text', 'file', 'milestone_update'],
      default: 'text'
    }
  }],
  ratings: {
    employerRating: {
      rating: Number,
      review: String,
      date: Date
    },
    workerRating: {
      rating: Number,
      review: String,
      date: Date
    }
  },
  disputes: [{
    raisedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    description: String,
    status: {
      type: String,
      enum: ['open', 'under_review', 'resolved', 'closed'],
      default: 'open'
    },
    resolution: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    resolvedAt: Date
  }]
}, {
  timestamps: true
});

// Method to add milestone
contractSchema.methods.addMilestone = function(title, description, amount, dueDate) {
  this.terms.milestones.push({
    title,
    description,
    amount,
    dueDate
  });
};

// Method to update milestone status
contractSchema.methods.updateMilestoneStatus = function(milestoneIndex, status) {
  if (this.terms.milestones[milestoneIndex]) {
    this.terms.milestones[milestoneIndex].status = status;
  }
};

// Method to add payment
contractSchema.methods.addPayment = function(amount, type, description) {
  this.payments.push({
    amount,
    type,
    description
  });
  this.totalPaid += amount;
  
  if (this.totalPaid >= this.terms.amount) {
    this.paymentStatus = 'completed';
  } else if (this.totalPaid > 0) {
    this.paymentStatus = 'partial';
  }
};

// Method to add deliverable
contractSchema.methods.addDeliverable = function(title, description, fileUrl) {
  this.deliverables.push({
    title,
    description,
    fileUrl,
    submittedAt: new Date()
  });
};

// Method to add communication message
contractSchema.methods.addMessage = function(senderId, message, type = 'text') {
  this.communication.push({
    sender: senderId,
    message,
    type
  });
};

// Method to raise dispute
contractSchema.methods.raiseDispute = function(raisedBy, reason, description) {
  this.disputes.push({
    raisedBy,
    reason,
    description
  });
  this.status = 'disputed';
};

module.exports = mongoose.model('Contract', contractSchema); 