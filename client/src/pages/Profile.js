import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [blockchainAddress, setBlockchainAddress] = useState('');
  const [editing, setEditing] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    axios.get('/api/users/me')
      .then(res => {
        setProfile(res.data);
        setBlockchainAddress(res.data.blockchainAddress || '');
      })
      .catch(err => {
        if (err.response && (err.response.status === 401 || err.response.status === 404)) {
          window.location.href = '/login';
        }
      });
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleSave = async () => {
    await axios.put('/api/users/me', { blockchainAddress });
    setEditing(false);
  };

  const handleCopy = () => {
    if (blockchainAddress) {
      navigator.clipboard.writeText(blockchainAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Profile</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">Manage your account and preferences</p>
      </div>
      <div className="card p-6 bg-white dark:bg-gray-900">
        {profile ? (
          <>
            <div className="mb-4">
              <span className="font-semibold">Name:</span> {profile.name}
            </div>
            <div className="mb-4">
              <span className="font-semibold">Email:</span> {profile.email}
            </div>
            <div className="mb-4">
              <span className="font-semibold">User Type:</span> {profile.userType}
            </div>
            <div className="mb-4">
              <span className="font-semibold">Phone:</span> {profile.phone || <span className="text-gray-400">Not set</span>}
            </div>
            <div className="mb-4">
              <span className="font-semibold">Education:</span> {profile.profile?.education?.length > 0 ? (
                <ul className="list-disc ml-6">
                  {profile.profile.education.map((edu, idx) => (
                    <li key={idx}>
                      {edu.degree} at {edu.institution} ({edu.year})
                    </li>
                  ))}
                </ul>
              ) : <span className="text-gray-400 ml-2">Not set</span>}
            </div>
            <div className="mb-4">
              <span className="font-semibold">Blockchain Address:</span>
              {editing ? (
                <>
                  <input
                    type="text"
                    value={blockchainAddress}
                    onChange={e => setBlockchainAddress(e.target.value)}
                    className="ml-2 px-2 py-1 border rounded"
                  />
                  <button className="ml-2 px-3 py-1 bg-blue-600 text-white rounded" onClick={handleSave}>Save</button>
                  <button className="ml-2 px-3 py-1 bg-gray-300 rounded" onClick={() => setEditing(false)}>Cancel</button>
                </>
              ) : (
                <>
                  <span className="ml-2 select-all">{blockchainAddress || <span className="text-gray-400">Not set</span>}</span>
                  {blockchainAddress && (
                    <button
                      className="ml-2 px-2 py-1 bg-gray-200 rounded text-xs"
                      onClick={handleCopy}
                      title="Copy address"
                    >
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  )}
                  <button className="ml-2 px-3 py-1 bg-blue-600 text-white rounded" onClick={() => setEditing(true)}>Edit</button>
                </>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">Loading profile...</div>
        )}
      </div>
    </div>
  );
};

export default Profile; 