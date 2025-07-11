# Skill Marketplace Backend

A comprehensive MERN stack backend for a skill marketplace with blockchain integration, payment processing, and AI-powered job matching.

## Features

- 🔐 **JWT Authentication** - Secure user authentication and authorization
- 👥 **User Management** - Worker and employer profiles with skill management
- 💼 **Job Management** - Post, search, and apply for jobs with AI recommendations
- 📋 **Contract Management** - Complete contract lifecycle with milestones and payments
- 💳 **Payment Integration** - Razorpay integration for secure payments
- ⛓️ **Blockchain Integration** - Polygon network for skill certification
- 🤖 **AI Job Matching** - Cosine similarity-based job recommendations
- 💬 **Real-time Chat** - Socket.io for contract communication
- 📊 **Wallet System** - Digital wallet with transaction history

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with bcryptjs
- **Payments**: Razorpay
- **Blockchain**: Web3.js + Polygon Network
- **Real-time**: Socket.io
- **File Upload**: Multer

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Razorpay account
- Polygon network access

## Installation

1. **Clone the repository**
   ```bash
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/skill-marketplace
   JWT_SECRET=your-super-secret-jwt-key
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   POLYGON_RPC_URL=https://polygon-rpc.com
   SKILL_CERTIFICATION_CONTRACT_ADDRESS=your_contract_address
   ```

4. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Users
- `GET /api/users/workers` - Get all workers
- `GET /api/users/workers/:id` - Get worker profile
- `PUT /api/users/skills` - Update user skills
- `POST /api/users/certify` - Add skill certification
- `GET /api/users/wallet` - Get user wallet
- `GET /api/users/search/workers` - Search workers

### Jobs
- `POST /api/jobs` - Create new job
- `GET /api/jobs` - Get all jobs with filters
- `GET /api/jobs/:id` - Get job by ID
- `POST /api/jobs/:id/apply` - Apply to job
- `GET /api/jobs/recommendations` - AI job recommendations
- `GET /api/jobs/search/text` - Text search jobs

### Contracts
- `POST /api/contracts` - Create contract
- `GET /api/contracts/my-contracts` - Get user contracts
- `PUT /api/contracts/:id/status` - Update contract status
- `POST /api/contracts/:id/milestones` - Add milestone
- `POST /api/contracts/:id/messages` - Add message

### Payments
- `POST /api/payments/create-order` - Create payment order
- `POST /api/payments/verify` - Verify payment
- `POST /api/payments/milestone/:contractId` - Milestone payment
- `POST /api/payments/withdraw` - Withdraw from wallet
- `GET /api/payments/history` - Payment history

### Blockchain
- `POST /api/blockchain/generate-hash` - Generate certificate hash
- `POST /api/blockchain/certify` - Certify skill on blockchain
- `GET /api/blockchain/verify/:userAddress/:skillName` - Verify certification
- `GET /api/blockchain/user-certifications/:userAddress` - Get user certifications

## Database Models

### User
- Basic info (name, email, password)
- User type (worker/employer)
- Profile (skills, experience, education)
- Wallet (balance, transactions)
- Rating system

### Job
- Job details (title, description, budget)
- Skills required
- Applications and status
- Employer and selected worker

### Contract
- Contract terms and milestones
- Payment tracking
- Deliverables and communication
- Dispute resolution

## Blockchain Integration

The system uses Polygon network for skill certification:

1. **Smart Contract**: `SkillCertification.sol` stores certificate hashes
2. **Web3 Integration**: Node.js backend interacts with the contract
3. **Certificate Verification**: Hash-based verification system

### Smart Contract Features
- Skill certification storage
- Certificate hash verification
- Batch certification
- Revocation and updates
- Event emission for tracking

## Payment System

### Razorpay Integration
- Order creation and verification
- Payment processing
- Webhook handling
- Refund management

### Wallet System
- Digital wallet for workers
- Transaction history
- Withdrawal functionality
- Balance tracking

## AI Job Matching

The system uses cosine similarity to match workers with jobs:

1. **Skill Extraction**: Extract skills from user profiles and job requirements
2. **Vectorization**: Convert skills to numerical vectors
3. **Similarity Calculation**: Calculate cosine similarity between vectors
4. **Recommendation**: Return jobs with highest similarity scores

## Real-time Features

### Socket.io Integration
- Real-time chat for contracts
- Live notifications
- Status updates
- Message broadcasting

## Security Features

- JWT token authentication
- Password hashing with bcryptjs
- Input validation and sanitization
- CORS configuration
- Rate limiting (recommended)

## Deployment

### Environment Variables
Ensure all required environment variables are set in production:

```env
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
RAZORPAY_KEY_ID=your_production_razorpay_key
RAZORPAY_KEY_SECRET=your_production_razorpay_secret
CLIENT_URL=your_frontend_url
```

### Production Considerations
- Use HTTPS in production
- Set up proper CORS configuration
- Implement rate limiting
- Use environment-specific MongoDB connections
- Set up monitoring and logging
- Configure proper error handling

## Testing

```bash
# Run tests (when implemented)
npm test

# Run with coverage
npm run test:coverage
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository. 