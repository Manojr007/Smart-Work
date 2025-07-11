import React, { useState } from 'react';
import axios from 'axios';

const SkillCertification = () => {
  const [file, setFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [skillName, setSkillName] = useState('');
  const [certificateHash, setCertificateHash] = useState('');
  const [certifyStatus, setCertifyStatus] = useState('');
  const [verifyAddress, setVerifyAddress] = useState('');
  const [verifySkill, setVerifySkill] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle file upload and read as text
  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);
    const reader = new FileReader();
    reader.onload = (event) => {
      setFileContent(event.target.result);
    };
    reader.readAsText(uploadedFile);
  };

  // Generate hash for the uploaded document
  const handleGenerateHash = async (e) => {
    e.preventDefault();
    if (!fileContent || !skillName) {
      setCertifyStatus('Please upload a document and enter a skill name.');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('/api/blockchain/generate-hash', {
        fileContent,
        skillName
      });
      setCertificateHash(res.data.certificateHash);
      setCertifyStatus('Hash generated. Ready to certify on blockchain.');
    } catch (err) {
      setCertifyStatus('Failed to generate hash.');
    }
    setLoading(false);
  };

  // Certify skill on blockchain
  const handleCertify = async (e) => {
    e.preventDefault();
    if (!certificateHash || !skillName) {
      setCertifyStatus('Please generate a hash first.');
      return;
    }
    setLoading(true);
    try {
      // In a real app, userAddress would be fetched from user profile or wallet
      const userAddress = prompt('Enter your blockchain address for certification:');
      if (!userAddress) {
        setCertifyStatus('Certification cancelled.');
        setLoading(false);
        return;
      }
      const res = await axios.post('/api/blockchain/certify', {
        skillName,
        certificateHash,
        userAddress
      });
      setCertifyStatus('Skill certified on blockchain! Tx: ' + res.data.transactionHash);
    } catch (err) {
      setCertifyStatus('Failed to certify skill.');
    }
    setLoading(false);
  };

  // Verify certification for another user
  const handleVerify = async (e) => {
    e.preventDefault();
    setVerifyResult(null);
    setLoading(true);
    try {
      const res = await axios.get(`/api/blockchain/verify/${verifyAddress}/${verifySkill}`);
      setVerifyResult(res.data);
    } catch (err) {
      setVerifyResult({ error: 'Verification failed.' });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Skill Certification</h1>
        <p className="text-gray-600 mt-2">
          Certify your skills on the blockchain by uploading a document. Others can verify your certification.
        </p>
      </div>
      <div className="card p-6 mb-8">
        <form onSubmit={handleGenerateHash} className="space-y-4">
          <input
            type="text"
            placeholder="Skill Name"
            value={skillName}
            onChange={e => setSkillName(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
          <input
            type="file"
            accept=".txt,.pdf,.doc,.docx,.json,.md"
            onChange={handleFileChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded font-semibold"
            disabled={loading}
          >
            {loading ? 'Generating Hash...' : 'Generate Hash'}
          </button>
        </form>
        {certificateHash && (
          <div className="mt-4">
            <div className="text-xs text-gray-500 break-all">Hash: {certificateHash}</div>
            <button
              className="bg-green-600 text-white px-4 py-2 rounded font-semibold mt-2"
              onClick={handleCertify}
              disabled={loading}
            >
              {loading ? 'Certifying...' : 'Certify on Blockchain'}
            </button>
          </div>
        )}
        {certifyStatus && <div className="mt-4 text-sm text-blue-700">{certifyStatus}</div>}
      </div>
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-4">Verify Certification</h2>
        <form onSubmit={handleVerify} className="space-y-4">
          <input
            type="text"
            placeholder="User Blockchain Address"
            value={verifyAddress}
            onChange={e => setVerifyAddress(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
          <input
            type="text"
            placeholder="Skill Name"
            value={verifySkill}
            onChange={e => setVerifySkill(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
          <button
            type="submit"
            className="bg-purple-600 text-white px-4 py-2 rounded font-semibold"
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Verify Certification'}
          </button>
        </form>
        {verifyResult && (
          <div className="mt-4 text-sm">
            {verifyResult.error ? (
              <span className="text-red-600">{verifyResult.error}</span>
            ) : verifyResult.isCertified ? (
              <span className="text-green-700">Certified! Hash: {verifyResult.certificateHash} (Timestamp: {verifyResult.timestamp})</span>
            ) : (
              <span className="text-gray-700">Not certified for this skill.</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillCertification; 