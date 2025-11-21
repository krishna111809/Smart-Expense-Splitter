// backend/server.js
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const mongoose = require('mongoose');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET missing in .env — set a strong secret');
  process.exit(1);
}

const authRoutes = require('./routes/authRoutes');
const groupRoutes = require('./routes/groupRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const userLookupRoutes = require("./routes/userLookup");

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('MONGO_URI missing in .env');
  process.exit(1);
}

app.use(helmet());

// Basic rate limiter (adjust as needed)
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: Number(process.env.RATE_LIMIT_MAX || 120), // default 120 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// CORS - restrict origin via env var if provided
const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
};

app.use(cors(corsOptions));
app.use(express.json());

// mount routes
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/expenses', expenseRoutes);
app.use("/api/users", userLookupRoutes);

// simple health
app.get('/health', (req, res) => res.json({ ok: true }));

// 404 and error handlers
app.use((req, res) => {
  res.status(404).json({ msg: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err);
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({ msg: 'Server error' });
  } else {
    res.status(500).json({ msg: err.message || 'Server error', stack: err.stack });
  }
});

// connect to mongo and start server
mongoose.set('strictQuery', false);
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on ${PORT}`));
  })
  .catch(err => {
    console.error('Mongo connection error:', err.message || err);
    process.exit(1);
  });