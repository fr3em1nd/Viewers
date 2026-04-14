const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'dental-saas-secret-key-change-in-production';

// --- Database Setup ---
const db = new Database(path.join(__dirname, '..', 'dental.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    practice_name TEXT DEFAULT 'Dental Practice',
    role TEXT DEFAULT 'dentist',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS viewer_states (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    study_instance_uid TEXT NOT NULL,
    state_data TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, study_instance_uid)
  );

  CREATE TABLE IF NOT EXISTS measurements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    study_instance_uid TEXT NOT NULL,
    measurement_data TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// Seed a demo user if none exists
const existingUser = db.prepare('SELECT id FROM users LIMIT 1').get();
if (!existingUser) {
  const hashedPassword = bcrypt.hashSync('dental123', 10);
  db.prepare('INSERT INTO users (email, password, name, practice_name, role) VALUES (?, ?, ?, ?, ?)').run(
    'demo@dentalview.com',
    hashedPassword,
    'Dr. Demo',
    'DentalView Pro Clinic',
    'dentist'
  );
  console.log('Demo user created: demo@dentalview.com / dental123');
}

// --- Middleware ---
app.use(cors());
app.use(express.json({ limit: '10mb' }));

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

// --- Auth Routes ---

// POST /api/auth/register
app.post('/api/auth/register', (req, res) => {
  const { email, password, name, practiceName } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name are required' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const result = db.prepare(
    'INSERT INTO users (email, password, name, practice_name) VALUES (?, ?, ?, ?)'
  ).run(email, hashedPassword, name, practiceName || 'Dental Practice');

  const token = jwt.sign(
    { userId: result.lastInsertRowid, email, name },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.status(201).json({
    token,
    user: { id: result.lastInsertRowid, email, name, practiceName: practiceName || 'Dental Practice' },
  });
});

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      practiceName: user.practice_name,
      role: user.role,
    },
  });
});

// GET /api/auth/me
app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = db.prepare('SELECT id, email, name, practice_name, role FROM users WHERE id = ?').get(req.user.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ user: { ...user, practiceName: user.practice_name } });
});

// --- Viewer State Routes ---

// GET /api/state/:studyInstanceUID
app.get('/api/state/:studyInstanceUID', authenticateToken, (req, res) => {
  const state = db.prepare(
    'SELECT state_data, updated_at FROM viewer_states WHERE user_id = ? AND study_instance_uid = ?'
  ).get(req.user.userId, req.params.studyInstanceUID);

  if (!state) {
    return res.json({ state: null });
  }

  res.json({
    state: JSON.parse(state.state_data),
    updatedAt: state.updated_at,
  });
});

// PUT /api/state/:studyInstanceUID
app.put('/api/state/:studyInstanceUID', authenticateToken, (req, res) => {
  const { state } = req.body;

  if (!state) {
    return res.status(400).json({ error: 'State data is required' });
  }

  const stateJson = JSON.stringify(state);

  db.prepare(`
    INSERT INTO viewer_states (user_id, study_instance_uid, state_data)
    VALUES (?, ?, ?)
    ON CONFLICT(user_id, study_instance_uid)
    DO UPDATE SET state_data = ?, updated_at = CURRENT_TIMESTAMP
  `).run(req.user.userId, req.params.studyInstanceUID, stateJson, stateJson);

  res.json({ success: true });
});

// DELETE /api/state/:studyInstanceUID
app.delete('/api/state/:studyInstanceUID', authenticateToken, (req, res) => {
  db.prepare(
    'DELETE FROM viewer_states WHERE user_id = ? AND study_instance_uid = ?'
  ).run(req.user.userId, req.params.studyInstanceUID);

  res.json({ success: true });
});

// --- Measurements Routes ---

// GET /api/measurements/:studyInstanceUID
app.get('/api/measurements/:studyInstanceUID', authenticateToken, (req, res) => {
  const rows = db.prepare(
    'SELECT id, measurement_data, created_at, updated_at FROM measurements WHERE user_id = ? AND study_instance_uid = ? ORDER BY created_at DESC'
  ).all(req.user.userId, req.params.studyInstanceUID);

  const measurements = rows.map(row => ({
    id: row.id,
    ...JSON.parse(row.measurement_data),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));

  res.json({ measurements });
});

// POST /api/measurements/:studyInstanceUID
app.post('/api/measurements/:studyInstanceUID', authenticateToken, (req, res) => {
  const { measurements } = req.body;

  if (!measurements || !Array.isArray(measurements)) {
    return res.status(400).json({ error: 'Measurements array is required' });
  }

  const insertStmt = db.prepare(
    'INSERT INTO measurements (user_id, study_instance_uid, measurement_data) VALUES (?, ?, ?)'
  );

  const insertMany = db.transaction((items) => {
    // Clear existing measurements for this study
    db.prepare(
      'DELETE FROM measurements WHERE user_id = ? AND study_instance_uid = ?'
    ).run(req.user.userId, req.params.studyInstanceUID);

    for (const measurement of items) {
      insertStmt.run(
        req.user.userId,
        req.params.studyInstanceUID,
        JSON.stringify(measurement)
      );
    }
  });

  insertMany(measurements);

  res.json({ success: true, count: measurements.length });
});

// --- Health Check ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'dental-backend', timestamp: new Date().toISOString() });
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Dental Backend API running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
