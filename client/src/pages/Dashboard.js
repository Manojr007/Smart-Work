import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600 mt-2">
          Here's what's happening with your {user?.userType === 'worker' ? 'work' : 'hiring'}.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Stats Cards */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Jobs</h3>
          <p className="text-3xl font-bold text-blue-600">0</p>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Completed</h3>
          <p className="text-3xl font-bold text-green-600">0</p>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Earnings</h3>
          <p className="text-3xl font-bold text-purple-600">₹0</p>
        </div>
      </div>

      <div className="mt-8">
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Recent Activity
          </h2>
          <div className="text-center py-8">
            <p className="text-gray-500">No recent activity</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 