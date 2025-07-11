const mongoose = require('mongoose');
const User = require('./models/User');
const Job = require('./models/Job');
require('dotenv').config();

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  // Create employer user if not exists
  let employer = await User.findOne({ email: 'employer@example.com' });
  if (!employer) {
    employer = new User({
      name: 'Demo Employer',
      email: 'employer@example.com',
      password: 'password123',
      userType: 'employer',
      isVerified: true,
      isActive: true
    });
    await employer.save();
    console.log('Created employer user with email: employer@example.com, password: password123');
  }

  // Diverse jobs for big companies with images
  const jobs = [
    {
      title: 'Software Engineer',
      description: 'Join Google as a Software Engineer to build scalable web applications and cloud services.',
      employer: employer._id,
      category: 'technology',
      skills: [
        { name: 'Python', level: 'advanced' },
        { name: 'Cloud Computing', level: 'intermediate' },
        { name: 'Distributed Systems', level: 'intermediate' }
      ],
      budget: { min: 80000, max: 120000, currency: 'USD' },
      duration: 'monthly',
      location: 'Mountain View, CA',
      requirements: { experience: 'senior', education: 'B.Tech', certifications: ['GCP Certified'] },
      tags: ['google', 'software', 'cloud'],
      attachments: [{
        filename: 'google-logo.png',
        url: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
        type: 'image/svg+xml'
      }]
    },
    {
      title: 'Backend Developer',
      description: 'Work at Amazon to design and implement backend services for e-commerce at scale.',
      employer: employer._id,
      category: 'technology',
      skills: [
        { name: 'Java', level: 'advanced' },
        { name: 'AWS', level: 'intermediate' },
        { name: 'Microservices', level: 'intermediate' }
      ],
      budget: { min: 90000, max: 130000, currency: 'USD' },
      duration: 'monthly',
      location: 'Seattle, WA',
      requirements: { experience: 'senior', education: 'B.Tech', certifications: ['AWS Certified'] },
      tags: ['amazon', 'backend', 'aws'],
      attachments: [{
        filename: 'amazon-logo.png',
        url: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
        type: 'image/svg+xml'
      }]
    },
    {
      title: 'UI/UX Designer',
      description: 'Design intuitive user interfaces for Google’s next-gen products.',
      employer: employer._id,
      category: 'design',
      skills: [
        { name: 'UI Design', level: 'expert' },
        { name: 'Figma', level: 'advanced' },
        { name: 'User Research', level: 'intermediate' }
      ],
      budget: { min: 70000, max: 110000, currency: 'USD' },
      duration: 'monthly',
      location: 'Remote',
      requirements: { experience: 'intermediate', education: 'Any', certifications: [] },
      tags: ['google', 'uiux', 'design'],
      attachments: [{
        filename: 'google-logo.png',
        url: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
        type: 'image/svg+xml'
      }]
    },
    {
      title: 'Cloud Solutions Architect',
      description: 'Lead cloud architecture projects at Amazon Web Services.',
      employer: employer._id,
      category: 'technology',
      skills: [
        { name: 'Cloud Architecture', level: 'expert' },
        { name: 'AWS', level: 'expert' },
        { name: 'DevOps', level: 'advanced' }
      ],
      budget: { min: 100000, max: 150000, currency: 'USD' },
      duration: 'monthly',
      location: 'Remote',
      requirements: { experience: 'senior', education: 'B.Tech', certifications: ['AWS Certified Solutions Architect'] },
      tags: ['amazon', 'cloud', 'architect'],
      attachments: [{
        filename: 'amazon-logo.png',
        url: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
        type: 'image/svg+xml'
      }]
    },
    // Microsoft
    {
      title: 'Full Stack Developer',
      description: 'Develop and maintain enterprise applications at Microsoft.',
      employer: employer._id,
      category: 'technology',
      skills: [
        { name: 'C#', level: 'advanced' },
        { name: '.NET', level: 'advanced' },
        { name: 'React', level: 'intermediate' }
      ],
      budget: { min: 85000, max: 125000, currency: 'USD' },
      duration: 'monthly',
      location: 'Redmond, WA',
      requirements: { experience: 'senior', education: 'B.Tech', certifications: ['Microsoft Certified'] },
      tags: ['microsoft', 'fullstack', 'dotnet'],
      attachments: [{
        filename: 'microsoft-logo.png',
        url: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
        type: 'image/svg+xml'
      }]
    },
    // Facebook
    {
      title: 'Data Scientist',
      description: 'Analyze large datasets and build predictive models at Facebook (Meta).',
      employer: employer._id,
      category: 'technology',
      skills: [
        { name: 'Python', level: 'advanced' },
        { name: 'Machine Learning', level: 'expert' },
        { name: 'SQL', level: 'intermediate' }
      ],
      budget: { min: 95000, max: 140000, currency: 'USD' },
      duration: 'monthly',
      location: 'Menlo Park, CA',
      requirements: { experience: 'senior', education: 'M.Sc', certifications: [] },
      tags: ['facebook', 'data', 'ml'],
      attachments: [{
        filename: 'facebook-logo.png',
        url: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg',
        type: 'image/svg+xml'
      }]
    },
    // Netflix
    {
      title: 'DevOps Engineer',
      description: 'Automate and optimize cloud infrastructure for Netflix streaming services.',
      employer: employer._id,
      category: 'technology',
      skills: [
        { name: 'AWS', level: 'advanced' },
        { name: 'Terraform', level: 'intermediate' },
        { name: 'CI/CD', level: 'advanced' }
      ],
      budget: { min: 90000, max: 135000, currency: 'USD' },
      duration: 'monthly',
      location: 'Los Gatos, CA',
      requirements: { experience: 'intermediate', education: 'Any', certifications: [] },
      tags: ['netflix', 'devops', 'cloud'],
      attachments: [{
        filename: 'netflix-logo.png',
        url: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',
        type: 'image/svg+xml'
      }]
    },
    // Infosys
    {
      title: 'Business Analyst',
      description: 'Work with clients to analyze business processes and recommend IT solutions at Infosys.',
      employer: employer._id,
      category: 'consulting',
      skills: [
        { name: 'Business Analysis', level: 'advanced' },
        { name: 'Communication', level: 'advanced' },
        { name: 'Excel', level: 'intermediate' }
      ],
      budget: { min: 40000, max: 70000, currency: 'INR' },
      duration: 'monthly',
      location: 'Bangalore, India',
      requirements: { experience: 'intermediate', education: 'MBA', certifications: [] },
      tags: ['infosys', 'business', 'consulting'],
      attachments: [{
        filename: 'infosys-logo.png',
        url: 'https://upload.wikimedia.org/wikipedia/commons/6/6e/Infosys_logo.svg',
        type: 'image/svg+xml'
      }]
    },
    // TCS
    {
      title: 'QA Engineer',
      description: 'Ensure software quality and reliability for TCS enterprise clients.',
      employer: employer._id,
      category: 'technology',
      skills: [
        { name: 'Testing', level: 'advanced' },
        { name: 'Automation', level: 'intermediate' },
        { name: 'Selenium', level: 'intermediate' }
      ],
      budget: { min: 35000, max: 60000, currency: 'INR' },
      duration: 'monthly',
      location: 'Mumbai, India',
      requirements: { experience: 'entry', education: 'B.Tech', certifications: [] },
      tags: ['tcs', 'qa', 'testing'],
      attachments: [{
        filename: 'tcs-logo.png',
        url: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Tata_Consultancy_Services_Logo.svg',
        type: 'image/svg+xml'
      }]
    },
    // Apple
    {
      title: 'iOS Developer',
      description: 'Develop innovative iOS applications for Apple’s global user base.',
      employer: employer._id,
      category: 'technology',
      skills: [
        { name: 'Swift', level: 'advanced' },
        { name: 'iOS', level: 'advanced' },
        { name: 'UI/UX', level: 'intermediate' }
      ],
      budget: { min: 100000, max: 160000, currency: 'USD' },
      duration: 'monthly',
      location: 'Cupertino, CA',
      requirements: { experience: 'senior', education: 'B.Tech', certifications: [] },
      tags: ['apple', 'ios', 'mobile'],
      attachments: [{
        filename: 'apple-logo.png',
        url: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
        type: 'image/svg+xml'
      }]
    }
  ];

  // Remove existing jobs for this employer
  await Job.deleteMany({ employer: employer._id });

  // Insert jobs
  await Job.insertMany(jobs);
  console.log('Seeded jobs for employer (Google, Amazon, Microsoft, Facebook, Netflix, Infosys, TCS, Apple, etc).');

  await mongoose.disconnect();
  console.log('Done.');
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
}); 