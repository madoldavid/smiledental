PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS patients;

CREATE TABLE patients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  dob TEXT NOT NULL,
  address TEXT NOT NULL,
  consent INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE appointments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL,
  service TEXT NOT NULL,
  clinician TEXT NOT NULL,
  start_at TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('booked','completed','cancelled')),
  notes TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY(patient_id) REFERENCES patients(id)
);

CREATE INDEX idx_patients_email ON patients(email);
CREATE INDEX idx_appt_start ON appointments(start_at);
CREATE INDEX idx_appt_clinician_start ON appointments(clinician, start_at);
