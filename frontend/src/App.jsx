
import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [toast, setToast] = useState(null);

function showToast(message, type = 'success') {
  setToast({ message, type });
}
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('All');
  const [searched, setSearched] = useState(false);
  const [apiStatus, setApiStatus] = useState('Connecting to backend...');

  const [showApplications, setShowApplications] = useState(false);
  const [applications, setApplications] = useState([]);

  const [showAdmin, setShowAdmin] = useState(false);
  const [adminStats, setAdminStats] = useState(null);

  const [authMode, setAuthMode] = useState('');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [loggedInUser, setLoggedInUser] = useState(null);
const emptyJob = {
  title: '',
  company: '',
  location: '',
  type: 'Internship',
  skills: '',
};

const [jobForm, setJobForm] = useState(emptyJob);
  // Load jobs from backend
  useEffect(() => {
    fetch('http://localhost:5000/api/jobs')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch jobs');
        }
        return response.json();
      })
      .then((data) => {
        setJobs(data);
        setApiStatus('Connected to backend successfully!');
      })
      .catch((error) => {
        console.error('Jobs fetch error:', error);
        setApiStatus('Backend connection failed. Please check the server.');
      });
  }, []);

  // Load applications when the applications page opens
  useEffect(() => {
    if (!showApplications) return;

    fetch('http://localhost:5000/api/applications')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch applications');
        }
        return response.json();
      })
      .then((data) => setApplications(data))
      .catch((error) => {
        console.error('Applications error:', error);
        showToast('Could not load applications. Please check the backend.', 'error');
      });
  }, [showApplications]);

  const filteredJobs = jobs.filter((job) => {
    const text = `${job.title} ${job.company} ${job.skills}`.toLowerCase();

    return (
      text.includes(keyword.toLowerCase()) &&
      job.location.toLowerCase().includes(location.toLowerCase()) &&
      (jobType === 'All' || job.type === jobType)
    );
  });

  function goHome() {
    setShowAdmin(false);
    setShowApplications(false);
    setAuthMode('');
  }

  function handleSearch(event) {
    event.preventDefault();
    setSearched(true);
    setShowAdmin(false);
    setShowApplications(false);

    setTimeout(() => {
      document.getElementById('jobs')?.scrollIntoView({
        behavior: 'smooth',
      });
    }, 0);
  }

  async function openAdminDashboard() {
    try {
      const token = localStorage.getItem('placemateToken');

const response = await fetch(
  'http://localhost:5000/api/admin/dashboard',
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Could not load dashboard');
      }

      setAdminStats(data.stats);
      setShowAdmin(true);
      setShowApplications(false);
      setAuthMode('');
    } catch (error) {
      showToast(error.message || 'Could not load dashboard', 'error');
    }
  }

  async function submitApplication(job) {
    const studentName = prompt('Enter your full name:');
    if (!studentName?.trim()) return;

    const email = prompt('Enter your email address:');
    if (!email?.trim()) return;

    try {
      const response = await fetch(
        'http://localhost:5000/api/applications',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            studentName: studentName.trim(),
            email: email.trim(),
            jobId: job.id,
            jobTitle: job.title,
            company: job.company,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Application failed');
      }

      showToast(data.message || 'Application submitted successfully!', 'success');
    } catch (error) {
      showToast(error.message || 'Could not submit application.', 'error');
    }
  }

  async function handleAuth(event) {
    event.preventDefault();
    if (isAuthenticating) return;
    setIsAuthenticating(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/${authMode}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: authName,
            email: authEmail,
            password: authPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      if (authMode === 'register') {
        showToast('Registration successful! Please log in.', 'success');
        setAuthMode('login');
        setAuthPassword('');
        return;
      }

      if (data.token) {
        localStorage.setItem('placemateToken', data.token);
      }

      setLoggedInUser(data.user);
      setAuthMode('');
      setAuthName('');
      setAuthEmail('');
      setAuthPassword('');

    showToast(data.message || 'Login successful!', 'success');
  } catch (error) {
    showToast(error.message || 'Something went wrong.', 'error');
  } finally {
    setIsAuthenticating(false);
    }
  }


  function logout() {
    localStorage.removeItem('placemateToken');
    setLoggedInUser(null);
    setAuthMode('');
    alert('Logged out successfully!');
  }

const handleJobFormChange = (event) => {
  setJobForm({
    ...jobForm,
    [event.target.name]: event.target.value,
  });
};

const editJob = (job) => {
  setEditingJobId(job.id);
  setJobForm({
    title: job.title,
    company: job.company,
    location: job.location,
    type: job.type,
    skills: job.skills,
  });
  setShowJobForm(true);
};

const saveJob = async (event) => {
  event.preventDefault();

  try {
    const response = await fetch(
      editingJobId
        ? `http://localhost:5000/api/jobs/${editingJobId}`
        : 'http://localhost:5000/api/jobs',
      {
        method: editingJobId ? 'PUT' : 'POST',
        headers: {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('placemateToken')}`,
},
        body: JSON.stringify(jobForm),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Unable to save job');
    }

    const jobsResponse = await fetch('http://localhost:5000/api/jobs');
    setJobs(await jobsResponse.json());

    setShowJobForm(false);
    setEditingJobId(null);
    setJobForm(emptyJob);
    await openAdminDashboard();

    alert(data.message);
  } catch (error) {
    alert(error.message);
  }
};

const deleteJob = async (id) => {
  if (!window.confirm('Are you sure you want to delete this job?')) {
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:5000/api/jobs/${id}`,
      { method: 'DELETE' }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Unable to delete job');
    }

    const jobsResponse = await fetch('http://localhost:5000/api/jobs');
    setJobs(await jobsResponse.json());

    await openAdminDashboard();
    alert(data.message);
  } catch (error) {
    alert(error.message);
  }
};
  return (
    <div className="app">
      {toast && (
  <div className={`toast-message toast-${toast.type}`} role="status">
    <span>{toast.type === 'success' ? '✓' : '!'}</span>
    {toast.message}
    <button type="button" onClick={() => setToast(null)}>
      ×
    </button>
  </div>
)}
      {/* Navigation */}
      <nav className="navbar">
        <h2>
          Place<span>Mate</span>
        </h2>

        <div className="nav-links">
          <a
            href="#home"
            onClick={(event) => {
              event.preventDefault();
              goHome();
            }}
          >
            Home
          </a>

          <a
            href="#jobs"
            onClick={(event) => {
              event.preventDefault();
              goHome();
              setTimeout(() => {
                document.getElementById('jobs')?.scrollIntoView({
                  behavior: 'smooth',
                });
              }, 0);
            }}
          >
            Find Jobs
          </a>

          <a
            href="#about"
            onClick={(event) => {
              event.preventDefault();
              goHome();
              setTimeout(() => {
                document.getElementById('about')?.scrollIntoView({
                  behavior: 'smooth',
                });
              }, 0);
            }}
          >
            About
          </a>

          <a
            href="#applications"
            onClick={(event) => {
              event.preventDefault();
              setShowApplications(true);
              setShowAdmin(false);
              setAuthMode('');
            }}
          >
            My Applications
          </a>
        </div>

        <div className="nav-actions">
          {loggedInUser ? (
            <>
              <span>Hi, {loggedInUser.name}</span>
              <button className="login-btn" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                className="login-btn"
                onClick={() => {
                  setAuthMode('login');
                  setShowAdmin(false);
                  setShowApplications(false);
                }}
              >
                Login
              </button>

              <button
                className="login-btn"
                onClick={() => {
                  setAuthMode('register');
                  setShowAdmin(false);
                  setShowApplications(false);
                }}
              >
                Register
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Backend status */}
      <p className="api-status">{apiStatus}</p>

      {/* Login and Registration */}
      {authMode && (
        <section className={`auth-section auth-${authMode}`}>
  <div className="auth-visual">
    <span className="auth-brand">Place<span>Mate</span></span>
    <div className="auth-visual-content">
      <span className="auth-eyebrow">YOUR NEXT CHAPTER</span>
      <h2>Your future<br />starts with one step.</h2>
      <p>Discover opportunities, showcase your skills, and move closer to your dream career.</p>
      <div className="auth-visual-badge">✦ Your career journey starts here</div>

<div className="auth-floating-cards">
  <div className="auth-float-card auth-float-card-one">
    <span className="auth-float-icon">💼</span>
    <div>
      <strong>New Opportunities</strong>
      <p>Discover your next role</p>
    </div>
    <span className="auth-float-check">✓</span>
  </div>

  <div className="auth-float-card auth-float-card-two">
    <span className="auth-float-icon">🚀</span>
    <div>
      <strong>Career Growth</strong>
      <p>Your journey starts here</p>
    </div>
    <span className="auth-float-check">✦</span>
  </div>
</div>

    </div>
    <div className="auth-orb auth-orb-one"></div>
    <div className="auth-orb auth-orb-two"></div>
  </div>
          <form className="auth-form" onSubmit={handleAuth}>
            <h2>
              {authMode === 'login'
                ? 'Welcome Back!'
                : 'Create Your Account'}
            </h2>

            <p>
              {authMode === 'login'
                ? 'Login to your PlaceMate account.'
                : 'Join PlaceMate and explore career opportunities.'}
            </p>

            {authMode === 'register' && (
              <input
                type="text"
                placeholder="Full name"
                value={authName}
                onChange={(event) => setAuthName(event.target.value)}
                required
              />
            )}

            <input
              type="email"
              placeholder="Email address"
              value={authEmail}
              onChange={(event) => setAuthEmail(event.target.value)}
              required
            />

            
<div className="password-field">
  <input
    type={showPassword ? 'text' : 'password'}
    placeholder="Password (minimum 8 characters)"
    value={authPassword}
    onChange={(event) => setAuthPassword(event.target.value)}
    minLength={8}
    required
  />
  <button
    type="button"
    className="password-toggle"
    onClick={() => setShowPassword((previous) => !previous)}
    aria-label={showPassword ? 'Hide password' : 'Show password'}
  >
    {showPassword ? 'Hide' : 'Show'}
  </button>
</div>


            <button
  type="submit"
  className="apply-btn"
  disabled={isAuthenticating}
>
  {isAuthenticating
    ? (authMode === 'login' ? 'Signing in...' : 'Creating account...')
    : (authMode === 'login' ? 'Login' : 'Register')}
</button>

            <p className="auth-switch">
              {authMode === 'login'
                ? "Don't have an account? "
                : 'Already registered? '}

              <button
                type="button"
                onClick={() =>
                  setAuthMode(
                    authMode === 'login' ? 'register' : 'login'
                  )
                }
              >
                {authMode === 'login' ? 'Register' : 'Login'}
              </button>
            </p>
          </form>
        </section>
      )}

      
      {/* Admin Dashboard */}
      {!authMode && showAdmin && (
        <section className="admin-dashboard">
          <div className="section-heading">
            <p className="tagline">ADMIN PANEL</p>
            <h2>Dashboard Overview</h2>
            <p>Manage and monitor your placement portal.</p>
          </div>

          <button className="apply-btn" onClick={goHome}>
            Back to Home
          </button>

          {adminStats && (
            <div className="admin-stats">
              <article className="admin-stat-card">
                <h3>Total Jobs</h3>
                <p>{adminStats.totalJobs}</p>
              </article>
              <article className="admin-stat-card">
                <h3>Total Applications</h3>
                <p>{adminStats.totalApplications}</p>
              </article>
              <article className="admin-stat-card">
                <h3>Registered Students</h3>
                <p>{adminStats.totalStudents}</p>
              </article>
            </div>
          )}

          <div className="section-heading">
            <h2>Manage Jobs</h2>
            <button
              className="apply-btn"
              onClick={() => {
                setEditingJobId(null);
                setJobForm(emptyJob);
                setShowJobForm(!showJobForm);
              }}
            >
              {showJobForm ? 'Cancel' : '+ Add Job'}
            </button>
          </div>

          {showJobForm && (
            <form className="search-box" onSubmit={saveJob}>
              <input
                name="title"
                placeholder="Job title"
                value={jobForm.title}
                onChange={handleJobFormChange}
                required
              />
              <input
                name="company"
                placeholder="Company"
                value={jobForm.company}
                onChange={handleJobFormChange}
                required
              />
              <input
                name="location"
                placeholder="Location"
                value={jobForm.location}
                onChange={handleJobFormChange}
                required
              />
              <select
                name="type"
                value={jobForm.type}
                onChange={handleJobFormChange}
              >
                <option value="Internship">Internship</option>
                <option value="Full-time">Full-time</option>
              </select>
              <input
                name="skills"
                placeholder="Skills (e.g. Java, Python)"
                value={jobForm.skills}
                onChange={handleJobFormChange}
                required
              />
              <button type="submit">
                {editingJobId ? 'Save Changes' : 'Add Job'}
              </button>
            </form>
          )}
<div className="job-grid">
  {jobs.map((job) => (
    <article className="job-card" key={job.id}>
      <span className="job-type">{job.type}</span>
      <h3>{job.title}</h3>
      
<div className="company-brand">
  <span className="company-logo">
    {job.company?.trim().charAt(0).toUpperCase() || 'C'}
  </span>
  <p className="company">{job.company}</p>
</div>
      <p>📍 {job.location}</p>
      <p className="skills">{job.skills}</p>                    
<div className="job-actions">
  <button
    className="apply-btn"
    onClick={() => editJob(job)}
  >
    Edit
  </button>
    
  <button
    className="delete-job-btn"
    onClick={() => deleteJob(job.id)}
  >
    Delete
  </button>
</div>
    </article>
  ))}
</div>
          {jobs.length === 0 && (
            <p className="empty-state">No jobs available. Add your first job!</p>
          )}
        </section>
      )}

      {/* My Applications */}
      {!authMode && showApplications && !showAdmin && (
        <section className="jobs-section applications-section" id="applications">
          <div className="section-heading">
            <p className="tagline">YOUR ACTIVITY</p>
            <h2>My Applications</h2>
            <p>Track the jobs you have applied for.</p>
          </div>

          <button className="apply-btn" onClick={goHome}>
            Back to Jobs
          </button>

          {applications.length === 0 ? (
            <p className="empty-state">No applications found.</p>
          ) : (
            <div className="job-grid">
              {applications.map((application) => (
                <article className="job-card" key={application._id}>
                  <div className="application-company">
  <span className="company-logo">
    {application.company?.charAt(0).toUpperCase() || 'C'}
  </span>
  <div>
    <h3>{application.jobTitle}</h3>
    <p className="company">{application.company}</p>
  </div>
</div>
                  <p>Student: {application.studentName}</p>
                  <p>Email: {application.email}</p>
                  <p>
                    Applied on:{' '}
                    {new Date(application.appliedAt).toLocaleDateString()}
                  </p>
                  <span className="application-status">
  <span className="status-dot"></span>
  Application Submitted
</span>
                </article>
              ))}
            </div>
          )}

          <button
            className="login-btn"
            onClick={openAdminDashboard}
          >
            Admin Dashboard
          </button>
        </section>
      )}

      {/* Home page and jobs */}
      {!authMode && !showAdmin && !showApplications && (
        <>
           
<main className="hero hero-visual" id="home">
  <div className="hero-content">
    <p className="tagline">
      YOUR CAREER STARTS HERE
    </p>

    <h1>
      Find Your Dream Job.
      <br />
      <span>Build Your Future.</span>
    </h1>

    <p className="description">
      Connect with top companies, explore opportunities,
      and take the next step in your career.
    </p>

    <form className="search-box" onSubmit={handleSearch}>
      <input
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
        placeholder="Job title or skill (e.g. Java)"
        aria-label="Search by job title or skill"
      />

      <input
        value={location}
        onChange={(event) => setLocation(event.target.value)}
        placeholder="Location (e.g. Hyderabad)"
        aria-label="Search by location"
      />

      <button type="submit">Search Jobs</button>
    </form>

    <p className="note">
      Built for students. Designed for your future.
    </p>
  </div>

  <div className="hero-visual-panel">
    <div className="hero-image-frame">
      <img
        src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1100&q=85"
        alt="Young professionals collaborating in a modern workplace"
      />

      <div className="hero-image-overlay" />

      <div className="floating-card floating-card-top">
        <span className="floating-icon">✦</span>
        <div>
          <strong>Your future starts here</strong>
          <p>Discover new possibilities</p>
        </div>
      </div>

      <div className="floating-card floating-card-bottom">
        <span className="floating-icon">↗</span>
        <div>
          <strong>Ready for your next step?</strong>
          <p>Explore career opportunities</p>
        </div>
      </div>
    </div>

    <div className="hero-orbit hero-orbit-one" />
    <div className="hero-orbit hero-orbit-two" />
  </div>

  <div className="hero-highlights">
    <div className="highlight-card">
      <span className="highlight-icon">💼</span>
      <div>
        <strong>Career Ready</strong>
        <p>Explore opportunities</p>
      </div>
    </div>

    <div className="highlight-card">
      <span className="highlight-icon">🚀</span>
      <div>
        <strong>Skill Focused</strong>
        <p>Find roles that fit you</p>
      </div>
    </div>

    <div className="highlight-card">
      <span className="highlight-icon">🎯</span>
      <div>
        <strong>Future Focused</strong>
        <p>Take your next step</p>
      </div>
    </div>
  </div>
</main>
          <section className="jobs-section" id="jobs">
            <div className="section-heading">
              <p className="tagline">OPPORTUNITIES FOR YOU</p>
              <h2>Explore Latest Jobs</h2>
              <p>Find a role that matches your skills and ambitions.</p>
            </div>

            <div className="filter-row">
              <label htmlFor="jobType">Employment type</label>

              <select
                id="jobType"
                value={jobType}
                onChange={(event) => {
                  setJobType(event.target.value);
                  setSearched(true);
                }}
              >
                <option value="All">All jobs</option>
                <option value="Internship">Internships</option>
                <option value="Full-time">Full-time</option>
              </select>
            </div>

            <p className="result-count">
              {filteredJobs.length}{' '}
              {filteredJobs.length === 1 ? 'job' : 'jobs'} found
              {searched ? ' for your search' : ''}
            </p>

            <div className="job-grid">
              {filteredJobs.map((job) => (
                <article className="job-card" key={job.id}>
                  <span className="job-type">{job.type}</span>
                  <h3>{job.title}</h3>
                  <div className="company-brand">
  <span className="company-logo">
    {job.company?.trim().charAt(0).toUpperCase() || 'C'}
  </span>
  <p className="company">{job.company}</p>
</div>
                  <p className="job-location">📍 {job.location}</p>
                  <p className="skills">{job.skills}</p>

                  <button
                    className="apply-btn"
                    onClick={() => submitApplication(job)}
                  >
                    View &amp; Apply
                  </button>
                </article>
              ))}
            </div>

            {filteredJobs.length === 0 && (
              <p className="empty-state">
                No matching jobs found. Try another keyword or location.
              </p>
            )}
          </section>

          <footer id="about">
            <h2>PlaceMate</h2>
            <p>Helping students take the next step in their careers.</p>
            <button
              className="login-btn"
              onClick={openAdminDashboard}
            >
              Admin Dashboard
            </button>
          </footer>
        </>
      )}
    </div>
  );
}

export default App;
