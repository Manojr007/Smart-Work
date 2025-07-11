import React, { useEffect, useState } from 'react';
import axios from 'axios';

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingJobId, setApplyingJobId] = useState(null);
  const [appliedJobIds, setAppliedJobIds] = useState([]);
  const [form, setForm] = useState({ proposal: '', bidAmount: '', estimatedDuration: '' });
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    axios.get('/api/jobs')
      .then(res => {
        setJobs(res.data.jobs || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleApplyClick = (jobId) => {
    setApplyingJobId(jobId);
    setForm({ proposal: '', bidAmount: '', estimatedDuration: '' });
    setFeedback('');
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleApplySubmit = async (jobId) => {
    setFeedback('');
    try {
      await axios.post(`/api/jobs/${jobId}/apply`, form);
      setAppliedJobIds([...appliedJobIds, jobId]);
      setApplyingJobId(null);
      setFeedback('Application submitted!');
    } catch (err) {
      setFeedback(err.response?.data?.message || 'Failed to apply.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Browse Jobs</h1>
        <p className="text-gray-600 mt-2">
          Find the perfect opportunity for your skills
        </p>
      </div>

      <div className="card p-6">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading jobs...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No jobs found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map(job => (
              <div key={job._id} className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
                {job.attachments && job.attachments[0]?.url && (
                  <img
                    src={job.attachments[0].url}
                    alt="Company Logo"
                    className="h-16 mb-4"
                  />
                )}
                <h2 className="text-xl font-semibold mb-2">{job.title}</h2>
                <p className="text-gray-700 mb-2">{job.description}</p>
                <div className="text-sm text-gray-500 mb-2">{job.location}</div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {job.skills?.map((skill, idx) => (
                    <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      {skill.name} ({skill.level})
                    </span>
                  ))}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  Budget: {job.budget?.min} - {job.budget?.max} {job.budget?.currency}
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {job.tags?.map((tag, idx) => (
                    <span key={idx} className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
                {appliedJobIds.includes(job._id) ? (
                  <button className="bg-green-200 text-green-800 px-4 py-2 rounded font-semibold cursor-not-allowed" disabled>
                    Applied
                  </button>
                ) : applyingJobId === job._id ? (
                  <div className="w-full">
                    <input
                      type="text"
                      name="proposal"
                      placeholder="Proposal"
                      value={form.proposal}
                      onChange={handleFormChange}
                      className="w-full mb-2 px-3 py-2 border rounded"
                    />
                    <input
                      type="number"
                      name="bidAmount"
                      placeholder="Bid Amount"
                      value={form.bidAmount}
                      onChange={handleFormChange}
                      className="w-full mb-2 px-3 py-2 border rounded"
                    />
                    <input
                      type="text"
                      name="estimatedDuration"
                      placeholder="Estimated Duration"
                      value={form.estimatedDuration}
                      onChange={handleFormChange}
                      className="w-full mb-2 px-3 py-2 border rounded"
                    />
                    <div className="flex gap-2">
                      <button
                        className="bg-blue-600 text-white px-4 py-2 rounded font-semibold"
                        onClick={() => handleApplySubmit(job._id)}
                      >
                        Submit Application
                      </button>
                      <button
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded font-semibold"
                        onClick={() => setApplyingJobId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                    {feedback && <div className="text-sm text-red-600 mt-2">{feedback}</div>}
                  </div>
                ) : (
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded font-semibold mt-2"
                    onClick={() => handleApplyClick(job._id)}
                  >
                    Apply
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobList; 