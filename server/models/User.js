const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  userType: {
    type: String,
    enum: ['worker', 'employer'],
    required: true
  },
  phone: {
    type: String,
    trim: true
  },
  profile: {
    avatar: String,
    bio: String,
    location: String,
    skills: [{
      name: String,
      level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert']
      },
      certified: {
        type: Boolean,
        default: false
      },
      certificateHash: String,
      blockchainTxId: String
    }],
    experience: [{
      title: String,
      company: String,
      duration: String,
      description: String
    }],
    education: [{
      degree: String,
      institution: String,
      year: Number
    }]
  },
  wallet: {
    balance: {
      type: Number,
      default: 0
    },
    transactions: [{
      type: {
        type: String,
        enum: ['credit', 'debit']
      },
      amount: Number,
      description: String,
      timestamp: {
        type: Date,
        default: Date.now
      },
      transactionId: String
    }]
  },
  rating: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  blockchainAddress: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to add skill certification
userSchema.methods.addSkillCertification = function(skillName, certificateHash, blockchainTxId) {
  const skill = this.profile.skills.find(s => s.name === skillName);
  if (skill) {
    skill.certified = true;
    skill.certificateHash = certificateHash;
    skill.blockchainTxId = blockchainTxId;
  } else {
    this.profile.skills.push({
      name: skillName,
      certified: true,
      certificateHash,
      blockchainTxId
    });
  }
};

// Method to update wallet balance
userSchema.methods.updateWallet = function(amount, type, description, transactionId) {
  this.wallet.balance += amount;
  this.wallet.transactions.push({
    type,
    amount: Math.abs(amount),
    description,
    transactionId
  });
};

module.exports = mongoose.model('User', userSchema); 