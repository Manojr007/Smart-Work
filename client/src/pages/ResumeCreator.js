import React, { useState } from 'react';
// import jsPDF for PDF download (install with npm if not present)
// import jsPDF from 'jspdf';

const initialState = {
  name: '',
  email: '',
  phone: '',
  address: '',
  linkedin: '',
  summary: '',
  skills: [''],
  experience: [{ company: '', role: '', duration: '', description: '' }],
  education: [{ degree: '', institution: '', year: '' }],
  projects: [{ name: '', description: '' }],
  certifications: [''],
  languages: [''],
};

const ResumeCreator = () => {
  const [form, setForm] = useState(initialState);
  const [showPreview, setShowPreview] = useState(false);

  // Handle input changes for simple fields
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle array fields (skills, certifications, languages)
  const handleArrayChange = (e, idx, field) => {
    const arr = [...form[field]];
    arr[idx] = e.target.value;
    setForm({ ...form, [field]: arr });
  };
  const addArrayItem = (field) => {
    setForm({ ...form, [field]: [...form[field], ''] });
  };
  const removeArrayItem = (field, idx) => {
    const arr = [...form[field]];
    arr.splice(idx, 1);
    setForm({ ...form, [field]: arr });
  };

  // Handle object array fields (experience, education, projects)
  const handleObjArrayChange = (e, idx, field) => {
    const arr = [...form[field]];
    arr[idx][e.target.name] = e.target.value;
    setForm({ ...form, [field]: arr });
  };
  const addObjArrayItem = (field, obj) => {
    setForm({ ...form, [field]: [...form[field], obj] });
  };
  const removeObjArrayItem = (field, idx) => {
    const arr = [...form[field]];
    arr.splice(idx, 1);
    setForm({ ...form, [field]: arr });
  };

  const handlePreview = (e) => {
    e.preventDefault();
    setShowPreview(true);
  };

  // Download as PDF (optional, requires jsPDF)
  // const handleDownloadPDF = () => {
  //   const doc = new jsPDF();
  //   doc.text(form.name, 10, 10);
  //   // ...add more fields as needed
  //   doc.save('resume.pdf');
  // };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Resume Creator</h1>
      <form className="space-y-4" onSubmit={handlePreview}>
        <input type="text" name="name" placeholder="Full Name" value={form.name} onChange={handleChange} className="w-full px-3 py-2 border rounded" required />
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
        <input type="text" name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
        <input type="text" name="address" placeholder="Address" value={form.address} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
        <input type="text" name="linkedin" placeholder="LinkedIn URL" value={form.linkedin} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
        <textarea name="summary" placeholder="Professional Summary" value={form.summary} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
        {/* Skills */}
        <div>
          <label className="block font-semibold mb-1">Skills</label>
          {form.skills.map((skill, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <input type="text" value={skill} onChange={e => handleArrayChange(e, idx, 'skills')} className="flex-1 px-3 py-2 border rounded" placeholder="Skill" />
              <button type="button" onClick={() => removeArrayItem('skills', idx)} className="text-red-500">Remove</button>
            </div>
          ))}
          <button type="button" onClick={() => addArrayItem('skills')} className="text-blue-600">+ Add Skill</button>
        </div>
        {/* Experience */}
        <div>
          <label className="block font-semibold mb-1">Experience</label>
          {form.experience.map((exp, idx) => (
            <div key={idx} className="mb-2 border p-2 rounded">
              <input type="text" name="company" value={exp.company} onChange={e => handleObjArrayChange(e, idx, 'experience')} className="w-full mb-1 px-3 py-2 border rounded" placeholder="Company" />
              <input type="text" name="role" value={exp.role} onChange={e => handleObjArrayChange(e, idx, 'experience')} className="w-full mb-1 px-3 py-2 border rounded" placeholder="Role" />
              <input type="text" name="duration" value={exp.duration} onChange={e => handleObjArrayChange(e, idx, 'experience')} className="w-full mb-1 px-3 py-2 border rounded" placeholder="Duration" />
              <textarea name="description" value={exp.description} onChange={e => handleObjArrayChange(e, idx, 'experience')} className="w-full px-3 py-2 border rounded" placeholder="Description" />
              <button type="button" onClick={() => removeObjArrayItem('experience', idx)} className="text-red-500 mt-1">Remove</button>
            </div>
          ))}
          <button type="button" onClick={() => addObjArrayItem('experience', { company: '', role: '', duration: '', description: '' })} className="text-blue-600">+ Add Experience</button>
        </div>
        {/* Education */}
        <div>
          <label className="block font-semibold mb-1">Education</label>
          {form.education.map((edu, idx) => (
            <div key={idx} className="mb-2 border p-2 rounded">
              <input type="text" name="degree" value={edu.degree} onChange={e => handleObjArrayChange(e, idx, 'education')} className="w-full mb-1 px-3 py-2 border rounded" placeholder="Degree" />
              <input type="text" name="institution" value={edu.institution} onChange={e => handleObjArrayChange(e, idx, 'education')} className="w-full mb-1 px-3 py-2 border rounded" placeholder="Institution" />
              <input type="text" name="year" value={edu.year} onChange={e => handleObjArrayChange(e, idx, 'education')} className="w-full px-3 py-2 border rounded" placeholder="Year" />
              <button type="button" onClick={() => removeObjArrayItem('education', idx)} className="text-red-500 mt-1">Remove</button>
            </div>
          ))}
          <button type="button" onClick={() => addObjArrayItem('education', { degree: '', institution: '', year: '' })} className="text-blue-600">+ Add Education</button>
        </div>
        {/* Projects */}
        <div>
          <label className="block font-semibold mb-1">Projects</label>
          {form.projects.map((proj, idx) => (
            <div key={idx} className="mb-2 border p-2 rounded">
              <input type="text" name="name" value={proj.name} onChange={e => handleObjArrayChange(e, idx, 'projects')} className="w-full mb-1 px-3 py-2 border rounded" placeholder="Project Name" />
              <textarea name="description" value={proj.description} onChange={e => handleObjArrayChange(e, idx, 'projects')} className="w-full px-3 py-2 border rounded" placeholder="Description" />
              <button type="button" onClick={() => removeObjArrayItem('projects', idx)} className="text-red-500 mt-1">Remove</button>
            </div>
          ))}
          <button type="button" onClick={() => addObjArrayItem('projects', { name: '', description: '' })} className="text-blue-600">+ Add Project</button>
        </div>
        {/* Certifications */}
        <div>
          <label className="block font-semibold mb-1">Certifications</label>
          {form.certifications.map((cert, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <input type="text" value={cert} onChange={e => handleArrayChange(e, idx, 'certifications')} className="flex-1 px-3 py-2 border rounded" placeholder="Certification" />
              <button type="button" onClick={() => removeArrayItem('certifications', idx)} className="text-red-500">Remove</button>
            </div>
          ))}
          <button type="button" onClick={() => addArrayItem('certifications')} className="text-blue-600">+ Add Certification</button>
        </div>
        {/* Languages */}
        <div>
          <label className="block font-semibold mb-1">Languages</label>
          {form.languages.map((lang, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <input type="text" value={lang} onChange={e => handleArrayChange(e, idx, 'languages')} className="flex-1 px-3 py-2 border rounded" placeholder="Language" />
              <button type="button" onClick={() => removeArrayItem('languages', idx)} className="text-red-500">Remove</button>
            </div>
          ))}
          <button type="button" onClick={() => addArrayItem('languages')} className="text-blue-600">+ Add Language</button>
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-semibold w-full">Preview Resume</button>
        {/* <button type="button" onClick={handleDownloadPDF} className="bg-green-600 text-white px-4 py-2 rounded font-semibold w-full mt-2">Download as PDF</button> */}
      </form>
      {showPreview && (
        <div className="mt-8 p-6 bg-gray-50 rounded shadow">
          <h2 className="text-2xl font-bold mb-2">{form.name}</h2>
          <div className="text-gray-700 mb-1">{form.email} | {form.phone} | {form.address}</div>
          <div className="text-gray-700 mb-1">{form.linkedin && (<a href={form.linkedin} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">{form.linkedin}</a>)}</div>
          <div className="mb-4 text-gray-600">{form.summary}</div>
          <div className="mb-2">
            <span className="font-semibold">Skills:</span> {form.skills.filter(Boolean).join(', ')}
          </div>
          <div className="mb-2">
            <span className="font-semibold">Experience:</span>
            <ul className="list-disc ml-6">
              {form.experience.filter(e => e.company || e.role).map((exp, idx) => (
                <li key={idx} className="mb-1">
                  <span className="font-semibold">{exp.role}</span> at <span className="font-semibold">{exp.company}</span> ({exp.duration})<br />
                  <span className="text-gray-600">{exp.description}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mb-2">
            <span className="font-semibold">Education:</span>
            <ul className="list-disc ml-6">
              {form.education.filter(e => e.degree || e.institution).map((edu, idx) => (
                <li key={idx} className="mb-1">
                  <span className="font-semibold">{edu.degree}</span> at <span className="font-semibold">{edu.institution}</span> ({edu.year})
                </li>
              ))}
            </ul>
          </div>
          <div className="mb-2">
            <span className="font-semibold">Projects:</span>
            <ul className="list-disc ml-6">
              {form.projects.filter(p => p.name).map((proj, idx) => (
                <li key={idx} className="mb-1">
                  <span className="font-semibold">{proj.name}</span>: {proj.description}
                </li>
              ))}
            </ul>
          </div>
          <div className="mb-2">
            <span className="font-semibold">Certifications:</span> {form.certifications.filter(Boolean).join(', ')}
          </div>
          <div>
            <span className="font-semibold">Languages:</span> {form.languages.filter(Boolean).join(', ')}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeCreator; 