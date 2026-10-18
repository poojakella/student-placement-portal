require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student',
  },
});

const User = mongoose.models.User ||
  mongoose.model('User', userSchema);

const app = express();
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.',
    });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required.',
    });
  }

  next();
};
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const applicationSchema = new mongoose.Schema({
  studentName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  jobId: {
    type: String,
    required: true,
  },
  jobTitle: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
});

const Application =
  mongoose.models.Application ||
  mongoose.model('Application', applicationSchema);
  
const jobSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  company: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  type: {
    type: String,
    enum: ['Internship', 'Full-time'],
    required: true,
  },
  skills: { type: String, required: true, trim: true },
}, { timestamps: true });

const Job = mongoose.models.Job ||
  mongoose.model('Job', jobSchema);


app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to PlaceMate Student Placement Portal API!',
    status: 'Backend is running successfully',
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'PlaceMate backend is healthy!',
    database: mongoose.connection.readyState === 1
      ? 'Connected'
      : 'Disconnected',
  });
});

app.get('/api/jobs', async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });

    res.json(
      jobs.map((job) => ({
        id: job._id.toString(),
        title: job.title,
        company: job.company,
        location: job.location,
        type: job.type,
        skills: job.skills,
      }))
    );
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ message: 'Could not fetch jobs.' });
  }
});

app.post('/api/jobs', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, company, location, type, skills } = req.body;

    const job = await Job.create({
      title,
      company,
      location,
      type,
      skills,
    });

    res.status(201).json({
      message: 'Job added successfully!',
      job,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/jobs/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, company, location, type, skills } = req.body;

    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { title, company, location, type, skills },
      { new: true, runValidators: true }
    );

    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    res.json({
      message: 'Job updated successfully!',
      job,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/jobs/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    res.json({ message: 'Job deleted successfully!' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post('/api/applications', async (req, res) => {
  try {
    const { studentName, email, jobId, jobTitle, company } = req.body;

    if (
      !studentName?.trim() ||
      !email?.trim() ||
      !jobId ||
      !jobTitle ||
      !company
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields.',
      });
    }

    const application = await Application.create({
      studentName,
      email,
      jobId: Number(jobId),
      jobTitle,
      company,
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully!',
      applicationId: application._id,
    });
  } catch (error) {
    console.error('Application save error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Could not save application.',
    });
  }
});

app.get('/api/applications', async (req, res) => {
  try {
    const applications = await Application.find().sort({
      appliedAt: -1,
    });

    res.json(applications);
  } catch (error) {
    console.error('Fetch applications error:', error.message);
    res.status(500).json({
      message: 'Could not fetch applications.',
    });
  }
});

app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (
      !name?.trim() ||
      !email?.trim() ||
      !password ||
      password.length < 8
    ) {
      return res.status(400).json({
        success: false,
        message: 'Enter your name, valid email, and password with at least 8 characters.',
      });
    }

    const existingUser = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'This email is already registered.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Registration failed.',
    });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: 'Server authentication is not configured.',
      });
    }

    const token = jwt.sign(
      { userId: user._id.toString(), role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Login failed.',
    });
  }
});

app.get('/api/admin/dashboard', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [totalJobs, totalApplications, totalStudents] =
      await Promise.all([
        Job.countDocuments(),
        Application.countDocuments(),
        User.countDocuments({ role: 'student' }),
      ]);

    res.json({
      success: true,
      stats: {
        totalJobs,
        totalApplications,
        totalStudents,
      },
    });
  } catch (error) {
    console.error('Dashboard error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Could not load dashboard statistics.',
    });
  }
});


async function startServer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully!');

const jobsCount = await Job.countDocuments();

if (jobsCount === 0) {
  await Job.insertMany([
    {
      title: 'Software Engineer Intern',
      company: 'TechNova',
      location: 'Hyderabad',
      type: 'Internship',
      skills: 'Java, Python, DSA',
    },
    {
      title: 'Frontend Developer',
      company: 'PixelWorks',
      location: 'Bengaluru',
      type: 'Full-time',
      skills: 'React, JavaScript, CSS',
    },
    {
      title: 'Python Developer Intern',
      company: 'DataBridge',
      location: 'Hyderabad',
      type: 'Internship',
      skills: 'Python, SQL, APIs',
    },
  ]);

  console.log('Initial jobs saved to MongoDB!');
}


    app.listen(PORT, () => {
      console.log(`PlaceMate backend running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
  }
}

startServer();
module.exports = { User };