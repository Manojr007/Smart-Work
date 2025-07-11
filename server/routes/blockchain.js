const express = require('express');
const { Web3, utils } = require('web3');
const crypto = require('crypto');
const User = require('../models/User');
const { auth, isWorker, isVerified } = require('../middleware/auth');

const router = express.Router();

// Initialize Web3 with Polygon network
const web3 = new Web3(process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com');

// Smart contract ABI (simplified for skill certification)
const contractABI = [
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "skillName",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "certificateHash",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "userAddress",
        "type": "address"
      }
    ],
    "name": "certifySkill",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "userAddress",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "skillName",
        "type": "string"
      }
    ],
    "name": "getCertification",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Initialize contract
const contractAddress = process.env.SKILL_CERTIFICATION_CONTRACT_ADDRESS;
const contract = new web3.eth.Contract(contractABI, contractAddress);

// Generate certificate hash from file
router.post('/generate-hash', auth, isWorker, async (req, res) => {
  try {
    const { fileContent, skillName } = req.body;

    if (!fileContent || !skillName) {
      return res.status(400).json({ message: 'File content and skill name are required' });
    }

    // Generate hash from file content and user data
    const dataToHash = `${fileContent}${req.user._id}${skillName}${Date.now()}`;
    const certificateHash = crypto.createHash('sha256').update(dataToHash).digest('hex');

    res.json({
      certificateHash,
      skillName,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Generate hash error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Certify skill on blockchain
router.post('/certify', auth, isWorker, isVerified, async (req, res) => {
  try {
    const { skillName, certificateHash, userAddress } = req.body;

    if (!skillName || !certificateHash) {
      return res.status(400).json({ 
        message: 'Skill name and certificate hash are required' 
      });
    }

    // Use provided userAddress or fetch from user profile
    let address = userAddress;
    if (!address) {
      const user = await User.findById(req.user._id);
      address = user.blockchainAddress;
    }
    if (!address || !utils.isAddress(address)) {
      return res.status(400).json({ message: 'Valid blockchain address is required' });
    }

    // Create transaction data
    const transactionData = contract.methods.certifySkill(
      skillName,
      certificateHash,
      address
    ).encodeABI();

    // Simulate the transaction
    const simulatedTxHash = `0x${crypto.randomBytes(32).toString('hex')}`;

    // Update user's skill certification
    const user = await User.findById(req.user._id);
    user.addSkillCertification(skillName, certificateHash, simulatedTxHash);
    await user.save();

    res.json({
      message: 'Skill certified successfully on blockchain',
      transactionHash: simulatedTxHash,
      skill: user.profile.skills.find(s => s.name === skillName)
    });
  } catch (error) {
    console.error('Certify skill error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify skill certification on blockchain
router.get('/verify/:userAddress/:skillName', auth, async (req, res) => {
  try {
    let { userAddress, skillName } = req.params;

    if (!utils.isAddress(userAddress)) {
      // Try to look up user by blockchainAddress
      const user = await User.findOne({ blockchainAddress: userAddress });
      if (!user || !user.blockchainAddress) {
        return res.status(400).json({ message: 'Invalid Ethereum address' });
      }
      userAddress = user.blockchainAddress;
    }

    // Call smart contract to get certification
    const certification = await contract.methods.getCertification(
      userAddress,
      skillName
    ).call();

    if (certification[0] !== '') {
      return res.json({
        isCertified: true,
        certificateHash: certification[0],
        timestamp: certification[1],
        userAddress,
        skillName
      });
    }

    // Fallback: check MongoDB for certification
    const user = await User.findOne({ blockchainAddress: userAddress, 'profile.skills.blockchainTxId': { $exists: true, $ne: null }, 'profile.skills.name': skillName });
    if (user) {
      const skill = user.profile.skills.find(s => s.name === skillName && s.blockchainTxId);
      if (skill) {
        return res.json({
          isCertified: true,
          certificateHash: skill.certificateHash,
          timestamp: Date.now(),
          userAddress,
          skillName
        });
      }
    }

    res.json({
      isCertified: false,
      certificateHash: '',
      timestamp: null,
      userAddress,
      skillName
    });
  } catch (error) {
    console.error('Verify certification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's blockchain certifications
router.get('/user-certifications/:userAddress', auth, async (req, res) => {
  try {
    const { userAddress } = req.params;

    if (!utils.isAddress(userAddress)) {
      return res.status(400).json({ message: 'Invalid Ethereum address' });
    }

    // Get user from database
    const user = await User.findOne({ 
      'profile.skills.blockchainTxId': { $exists: true, $ne: null } 
    });

    if (!user) {
      return res.json({ certifications: [] });
    }

    const certifications = user.profile.skills
      .filter(skill => skill.certified && skill.blockchainTxId)
      .map(skill => ({
        skillName: skill.name,
        certificateHash: skill.certificateHash,
        blockchainTxId: skill.blockchainTxId,
        certified: skill.certified
      }));

    res.json({ certifications });
  } catch (error) {
    console.error('Get user certifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get blockchain transaction details
router.get('/transaction/:txHash', auth, async (req, res) => {
  try {
    const { txHash } = req.params;

    // In a real application, you would:
    // 1. Get transaction details from blockchain
    // 2. Parse the transaction data
    // 3. Return relevant information

    // For now, we'll simulate the response
    res.json({
      transactionHash: txHash,
      status: 'confirmed',
      blockNumber: Math.floor(Math.random() * 1000000),
      timestamp: Date.now(),
      gasUsed: Math.floor(Math.random() * 100000),
      data: 'Simulated transaction data'
    });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Batch certify multiple skills
router.post('/batch-certify', auth, isWorker, isVerified, async (req, res) => {
  try {
    const { certifications } = req.body;

    if (!Array.isArray(certifications) || certifications.length === 0) {
      return res.status(400).json({ message: 'Certifications array is required' });
    }

    const user = await User.findById(req.user._id);
    const results = [];

    for (const cert of certifications) {
      const { skillName, certificateHash, userAddress } = cert;

      if (!skillName || !certificateHash || !userAddress) {
        results.push({
          skillName,
          success: false,
          error: 'Missing required fields'
        });
        continue;
      }

      try {
        // Simulate blockchain transaction
        const simulatedTxHash = `0x${crypto.randomBytes(32).toString('hex')}`;
        
        user.addSkillCertification(skillName, certificateHash, simulatedTxHash);
        
        results.push({
          skillName,
          success: true,
          transactionHash: simulatedTxHash
        });
      } catch (error) {
        results.push({
          skillName,
          success: false,
          error: error.message
        });
      }
    }

    await user.save();

    res.json({
      message: 'Batch certification completed',
      results
    });
  } catch (error) {
    console.error('Batch certify error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get blockchain network status
router.get('/network-status', auth, async (req, res) => {
  try {
    // Get network information
    const blockNumber = await web3.eth.getBlockNumber();
    const gasPrice = await web3.eth.getGasPrice();

    res.json({
      network: 'Polygon',
      blockNumber: blockNumber.toString(),
      gasPrice: web3.utils.fromWei(gasPrice, 'gwei') + ' Gwei',
      contractAddress,
      status: 'connected'
    });
  } catch (error) {
    console.error('Network status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 