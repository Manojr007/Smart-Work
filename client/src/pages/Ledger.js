import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Ledger = () => {
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCerts = () => {
    axios.get('/api/users')
      .then(res => {
        const allCerts = [];
        res.data.forEach(user => {
          (user.profile?.skills || []).forEach(skill => {
            if (skill.certified && skill.blockchainTxId) {
              allCerts.push({
                user: user.name,
                address: user.blockchainAddress || 'N/A',
                skill: skill.name,
                hash: skill.certificateHash,
                tx: skill.blockchainTxId,
                verified: skill.verifiedByValidator || false,
                timestamp: skill.certifiedAt || 'N/A',
              });
            }
          });
        });
        setCertifications(allCerts);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchCerts();
    const interval = setInterval(fetchCerts, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Skill Certification Ledger</h1>
      <p className="mb-4 text-gray-600">All skill certifications and their verification status. Validators can verify skills here.</p>
      {loading ? (
        <div>Loading...</div>
      ) : certifications.length === 0 ? (
        <div>No certifications found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded">
            <thead>
              <tr>
                <th className="px-4 py-2 border">User</th>
                <th className="px-4 py-2 border">Skill</th>
                <th className="px-4 py-2 border">Hash</th>
                <th className="px-4 py-2 border">Tx</th>
                <th className="px-4 py-2 border">Timestamp</th>
                <th className="px-4 py-2 border">Verified</th>
                <th className="px-4 py-2 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {certifications.map((cert, idx) => (
                <tr key={idx} className="text-sm">
                  <td className="px-4 py-2 border">{cert.user}</td>
                  <td className="px-4 py-2 border">{cert.skill}</td>
                  <td className="px-4 py-2 border break-all">{cert.hash}</td>
                  <td className="px-4 py-2 border break-all">{cert.tx}</td>
                  <td className="px-4 py-2 border">{cert.timestamp}</td>
                  <td className="px-4 py-2 border">{cert.verified ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-2 border">
                    {/* Placeholder for validator action */}
                    <button className="bg-green-600 text-white px-2 py-1 rounded text-xs" disabled={cert.verified}>
                      {cert.verified ? 'Verified' : 'Verify'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Ledger; 