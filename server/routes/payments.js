const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Contract = require('../models/Contract');
const User = require('../models/User');
const { auth, isEmployer } = require('../middleware/auth');

const router = express.Router();

// Initialize Razorpay (only if keys are provided)
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
}

// Create payment order
router.post('/create-order', auth, isEmployer, async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(503).json({ message: 'Payment service not configured' });
    }

    const { amount, currency = 'INR', contractId, description } = req.body;

    const contract = await Contract.findById(contractId);
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    if (contract.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency,
      receipt: `contract_${contractId}_${Date.now()}`,
      notes: {
        contractId,
        description
      }
    };

    const order = await razorpay.orders.create(options);

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify payment and process
router.post('/verify', auth, isEmployer, async (req, res) => {
  try {
    if (!razorpay || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(503).json({ message: 'Payment service not configured' });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, contractId } = req.body;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    const contract = await Contract.findById(contractId);
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    // Add payment to contract
    const amount = parseFloat(req.body.amount) / 100; // Convert from paise
    contract.addPayment(amount, 'milestone', 'Payment for contract work');
    
    // Update payment status
    const payment = contract.payments[contract.payments.length - 1];
    payment.status = 'completed';
    payment.transactionId = razorpay_payment_id;
    
    await contract.save();

    // Update worker's wallet
    const worker = await User.findById(contract.worker);
    if (worker) {
      worker.updateWallet(amount, 'credit', 'Payment for contract work', razorpay_payment_id);
      await worker.save();
    }

    res.json({
      message: 'Payment verified and processed successfully',
      payment: {
        amount,
        transactionId: razorpay_payment_id,
        status: 'completed'
      }
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Process milestone payment
router.post('/milestone/:contractId', auth, isEmployer, async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(503).json({ message: 'Payment service not configured' });
    }

    const { milestoneIndex, amount } = req.body;
    const { contractId } = req.params;

    const contract = await Contract.findById(contractId);
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    if (contract.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const milestone = contract.terms.milestones[milestoneIndex];
    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found' });
    }

    if (milestone.status !== 'completed') {
      return res.status(400).json({ message: 'Milestone must be completed before payment' });
    }

    // Create Razorpay order
    const options = {
      amount: amount * 100,
      currency: 'INR',
      receipt: `milestone_${contractId}_${milestoneIndex}_${Date.now()}`,
      notes: {
        contractId,
        milestoneIndex,
        milestoneTitle: milestone.title
      }
    };

    const order = await razorpay.orders.create(options);

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      milestone: milestone
    });
  } catch (error) {
    console.error('Milestone payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Withdraw from wallet
router.post('/withdraw', auth, async (req, res) => {
  try {
    const { amount, bankDetails } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.wallet.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // In a real application, you would:
    // 1. Integrate with a bank transfer API
    // 2. Process the withdrawal
    // 3. Update the wallet balance

    // For now, we'll simulate the withdrawal
    user.updateWallet(-amount, 'debit', 'Withdrawal to bank account', `withdraw_${Date.now()}`);
    await user.save();

    res.json({
      message: 'Withdrawal request submitted successfully',
      newBalance: user.wallet.balance,
      withdrawalAmount: amount
    });
  } catch (error) {
    console.error('Withdraw error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get payment history
router.get('/history', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const user = await User.findById(req.user._id).select('wallet');
    const transactions = user.wallet.transactions
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice((page - 1) * limit, page * limit);

    res.json({
      transactions,
      totalPages: Math.ceil(user.wallet.transactions.length / limit),
      currentPage: parseInt(page),
      totalBalance: user.wallet.balance
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get contract payments
router.get('/contract/:contractId', auth, async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.contractId);

    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    // Check authorization
    if (contract.employer.toString() !== req.user._id.toString() &&
        contract.worker.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({
      payments: contract.payments,
      totalPaid: contract.totalPaid,
      totalAmount: contract.terms.amount,
      paymentStatus: contract.paymentStatus
    });
  } catch (error) {
    console.error('Get contract payments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Refund payment (employer only)
router.post('/refund', auth, isEmployer, async (req, res) => {
  try {
    const { paymentId, amount, reason } = req.body;

    // In a real application, you would:
    // 1. Call Razorpay refund API
    // 2. Process the refund
    // 3. Update contract and wallet

    // For now, we'll simulate the refund
    res.json({
      message: 'Refund request submitted successfully',
      refundId: `refund_${Date.now()}`,
      amount,
      reason
    });
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 