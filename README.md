# 🚀 SkillMarket - Blockchain-Powered Skill Marketplace

A comprehensive MERN stack application that connects skilled workers with employers through a modern platform featuring blockchain-based skill certification, secure payments, and AI-powered job matching.

## ✨ Features

### 🔐 Authentication & User Management
- JWT-based authentication system
- Role-based access control (Worker/Employer)
- Secure password hashing with bcryptjs
- User profile management with skill tracking

### 💼 Job Management
- Post, search, and apply for jobs
- AI-powered job recommendations using cosine similarity
- Advanced filtering and search capabilities
- Real-time job status updates

### 📋 Contract Management
- Complete contract lifecycle management
- Milestone-based project tracking
- Real-time communication via Socket.io
- Dispute resolution system

### 💳 Payment Integration
- Razorpay payment gateway integration
- Digital wallet system for workers
- Secure payment processing
- Transaction history tracking

### ⛓️ Blockchain Integration
- Polygon network for skill certification
- Smart contract for certificate storage
- Web3.js integration for blockchain operations
- Certificate verification system

### 🤖 AI Features
- Skill-based job matching algorithm
- Recommendation engine
- Intelligent search functionality

### 💬 Real-time Features
- Live chat for contract communication
- Real-time notifications
- Status updates and alerts

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + bcryptjs
- **Payments**: Razorpay
- **Blockchain**: Web3.js + Polygon Network
- **Real-time**: Socket.io
- **File Upload**: Multer

### Frontend
- **Framework**: React 18
- **Styling**: Tailwind CSS
- **State Management**: React Query + Zustand
- **Routing**: React Router v6
- **UI Components**: Lucide React Icons
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast
- **Animations**: Framer Motion

### Blockchain
- **Network**: Polygon (Matic)
- **Smart Contracts**: Solidity
- **Web3 Library**: Web3.js
- **Development**: Hardhat (recommended)

## 📁 Project Structure

```
skill-marketplace/
├── server/                 # Backend API
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API endpoints
│   ├── middleware/        # Authentication & validation
│   ├── contracts/         # Solidity smart contracts
│   └── server.js          # Main server file
├── client/                # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom hooks
│   │   └── utils/         # Utility functions
│   └── public/            # Static assets
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Razorpay account
- Polygon network access

### Backend Setup

1. **Navigate to server directory**
   ```bash
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   ```
   
   Update `.env` with your configuration:
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
   npm run dev
   ```

### Frontend Setup

1. **Navigate to client directory**
   ```bash
   cd client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

### Smart Contract Deployment

1. **Install Hardhat**
   ```bash
   npm install -g hardhat
   ```

2. **Deploy the contract**
   ```bash
   npx hardhat compile
   npx hardhat deploy --network polygon
   ```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Job Endpoints
- `POST /api/jobs` - Create new job
- `GET /api/jobs` - Get all jobs with filters
- `GET /api/jobs/:id` - Get job by ID
- `POST /api/jobs/:id/apply` - Apply to job
- `GET /api/jobs/recommendations` - AI job recommendations

### Contract Endpoints
- `POST /api/contracts` - Create contract
- `GET /api/contracts/my-contracts` - Get user contracts
- `PUT /api/contracts/:id/status` - Update contract status

### Payment Endpoints
- `POST /api/payments/create-order` - Create payment order
- `POST /api/payments/verify` - Verify payment
- `GET /api/payments/history` - Payment history

### Blockchain Endpoints
- `POST /api/blockchain/certify` - Certify skill on blockchain
- `GET /api/blockchain/verify/:userAddress/:skillName` - Verify certification

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/skill-marketplace

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Payments
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Blockchain
POLYGON_RPC_URL=https://polygon-rpc.com
SKILL_CERTIFICATION_CONTRACT_ADDRESS=your_contract_address

# Client
CLIENT_URL=http://localhost:3000
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_POLYGON_RPC_URL=https://polygon-rpc.com
REACT_APP_CONTRACT_ADDRESS=your_contract_address
```

## 🎯 Key Features Explained

### AI Job Matching
The system uses cosine similarity to match workers with jobs:
1. Extract skills from user profiles and job requirements
2. Convert skills to numerical vectors
3. Calculate similarity scores
4. Return jobs with highest matches

### Blockchain Certification
- Workers upload skill certificates
- System generates SHA-256 hash
- Hash is stored on Polygon blockchain
- Verification through smart contract

### Payment System
- Razorpay integration for secure payments
- Digital wallet for workers
- Milestone-based payment tracking
- Transaction history and reporting

### Real-time Communication
- Socket.io for live chat
- Real-time notifications
- Status updates
- File sharing capabilities

## 🚀 Deployment

### Backend Deployment (Render/Heroku)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically on push

### Frontend Deployment (Vercel/Netlify)
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Deploy automatically on push

### Smart Contract Deployment
1. Deploy to Polygon mainnet
2. Update contract address in environment
3. Verify contract on Polygonscan

## 🧪 Testing

### Backend Tests
```bash
cd server
npm test
```

### Frontend Tests
```bash
cd client
npm test
```

### Smart Contract Tests
```bash
npx hardhat test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `/docs` folder
- **Issues**: Create an issue on GitHub
- **Discussions**: Use GitHub Discussions
- **Email**: support@skillmarket.com

## 🙏 Acknowledgments

- [Polygon Network](https://polygon.technology/) for blockchain infrastructure
- [Razorpay](https://razorpay.com/) for payment processing
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [React](https://reactjs.org/) for frontend framework
- [Express.js](https://expressjs.com/) for backend framework

## 📊 Project Status

- ✅ Backend API (Complete)
- ✅ Frontend UI (Complete)
- ✅ Authentication System (Complete)
- ✅ Job Management (Complete)
- ✅ Contract System (Complete)
- ✅ Payment Integration (Complete)
- ✅ Blockchain Integration (Complete)
- ✅ Real-time Features (Complete)
- 🔄 Testing (In Progress)
- 🔄 Documentation (In Progress)

---

**Built with ❤️ using modern web technologies** 