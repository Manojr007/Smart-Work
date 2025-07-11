import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const initialState = {
  title: '',
  description: '',
  category: 'technology',
  skills: '',
  budgetMin: '',
  budgetMax: '',
  duration: 'monthly',
  location: '',
  requirementsExperience: 'entry',
  requirementsEducation: '',
  tags: '',
};

const categories = [
  'technology', 'design', 'marketing', 'writing', 'consulting', 'other'
];
const durations = ['hourly', 'daily', 'weekly', 'monthly', 'project'];
const experiences = ['entry', 'intermediate', 'senior', 'expert'];

const PostJob = () => {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const jobData = {
        title: form.title,
        description: form.description,
        category: form.category,
        skills: form.skills.split(',').map(s => ({ name: s.trim() })),
        budget: { min: Number(form.budgetMin), max: Number(form.budgetMax), currency: 'USD' },
        duration: form.duration,
        location: form.location,
        requirements: {
          experience: form.requirementsExperience,
          education: form.requirementsEducation,
          certifications: []
        },
        tags: form.tags.split(',').map(t => t.trim()),
      };
      await axios.post('/api/jobs', jobData);
      setLoading(false);
      navigate('/jobs'); // Redirect to Browse Jobs
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post job.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Post a Job</h1>
        <p className="text-gray-600 mt-2">
          Find the perfect talent for your project
        </p>
      </div>
      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="title"
            placeholder="Job Title"
            value={form.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
          <textarea
            name="description"
            placeholder="Job Description"
            value={form.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
          <div className="flex gap-4">
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-1/2 px-3 py-2 border rounded"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              name="duration"
              value={form.duration}
              onChange={handleChange}
              className="w-1/2 px-3 py-2 border rounded"
            >
              {durations.map(dur => (
                <option key={dur} value={dur}>{dur}</option>
              ))}
            </select>
          </div>
          <input
            type="text"
            name="skills"
            placeholder="Skills (comma separated)"
            value={form.skills}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
          <div className="flex gap-4">
            <input
              type="number"
              name="budgetMin"
              placeholder="Min Budget"
              value={form.budgetMin}
              onChange={handleChange}
              className="w-1/2 px-3 py-2 border rounded"
              required
            />
            <input
              type="number"
              name="budgetMax"
              placeholder="Max Budget"
              value={form.budgetMax}
              onChange={handleChange}
              className="w-1/2 px-3 py-2 border rounded"
              required
            />
          </div>
          <input
            type="text"
            name="location"
            placeholder="Location"
            value={form.location}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
          <div className="flex gap-4">
            <select
              name="requirementsExperience"
              value={form.requirementsExperience}
              onChange={handleChange}
              className="w-1/2 px-3 py-2 border rounded"
            >
              {experiences.map(exp => (
                <option key={exp} value={exp}>{exp}</option>
              ))}
            </select>
            <input
              type="text"
              name="requirementsEducation"
              placeholder="Education"
              value={form.requirementsEducation}
              onChange={handleChange}
              className="w-1/2 px-3 py-2 border rounded"
            />
          </div>
          <input
            type="text"
            name="tags"
            placeholder="Tags (comma separated)"
            value={form.tags}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
          />
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded font-semibold w-full"
            disabled={loading}
          >
            {loading ? 'Posting...' : 'Post Job'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostJob; 