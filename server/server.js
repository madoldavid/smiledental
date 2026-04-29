import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = process.env.DB_PATH || path.join(__dirname, 'db', 'dental.sqlite');
const allowOrigin = process.env.ALLOW_ORIGIN || '*';
const app = express();
const port = process.env.PORT || 4000;

const db = new sqlite3.Database(dbPath);

app.use(cors({ origin: allowOrigin }));
app.use(express.json());
app.use(morgan('tiny'));

// Very small in-memory rate limiter
const hits = new Map();
app.use((req, res, next) => {
  const key = `${req.ip}-${new Date().getMinutes()}`;
  const count = hits.get(key) || 0;
  if (count > 60) return res.status(429).json({ error: 'Slow down' });
  hits.set(key, count + 1);
  next();
});

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', db: dbPath });
});

app.post('/api/patients', async (req, res) => {
  const { first_name, last_name, email, phone, dob, address, consent } = req.body || {};
  if (!first_name || !last_name || !email || !phone || !dob || !address) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (!consent) return res.status(400).json({ error: 'Consent required' });
  try {
    const dup = await all('SELECT id FROM patients WHERE email = ?', [email]);
    if (dup.length) return res.status(409).json({ error: 'Email already registered' });
    const now = new Date().toISOString();
    const result = await run(
      'INSERT INTO patients (first_name, last_name, email, phone, dob, address, consent, created_at) VALUES (?,?,?,?,?,?,?,?)',
      [first_name, last_name, email, phone, dob, address, consent ? 1 : 0, now]
    );
    res.status(201).json({ id: result.lastID, first_name, last_name, email, phone, dob, address, consent: 1, created_at: now });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/appointments', async (req, res) => {
  const { email, service, clinician, start_at, notes } = req.body || {};
  if (!email || !service || !clinician || !start_at) return res.status(400).json({ error: 'Missing required fields' });
  try {
    const [patient] = await all('SELECT id, first_name, last_name FROM patients WHERE email = ?', [email]);
    if (!patient) return res.status(404).json({ error: 'Patient not registered' });
    // prevent double booking within same 30-minute slot per clinician
    const overlap = await all(
      `SELECT id FROM appointments WHERE clinician = ? AND ABS(strftime('%s', start_at) - strftime('%s', ?)) < 1800`,
      [clinician, start_at]
    );
    if (overlap.length) return res.status(409).json({ error: 'Slot already taken' });
    const now = new Date().toISOString();
    const result = await run(
      'INSERT INTO appointments (patient_id, service, clinician, start_at, status, notes, created_at) VALUES (?,?,?,?,?,?,?)',
      [patient.id, service, clinician, start_at, 'booked', notes || '', now]
    );
    res.status(201).json({
      id: result.lastID,
      patient_id: patient.id,
      patient_name: `${patient.first_name} ${patient.last_name}`,
      patient_email: email,
      service,
      clinician,
      start_at,
      status: 'booked',
      notes: notes || '',
      created_at: now,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/reports/patients', async (_req, res) => {
  try {
    const rows = await all('SELECT * FROM patients ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/reports/appointments', async (req, res) => {
  const scope = req.query.scope;
  const nowIso = new Date().toISOString();
  let where = '';
  if (scope === 'future') where = "WHERE start_at >= ?";
  if (scope === 'past') where = "WHERE start_at < ?";
  const sql = `SELECT a.*, p.email as patient_email, p.first_name || ' ' || p.last_name as patient_name
               FROM appointments a
               LEFT JOIN patients p ON p.id = a.patient_id
               ${where}
               ORDER BY start_at`;
  try {
    const rows = await all(sql, scope ? [nowIso] : []);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});
