INSERT INTO patients (first_name, last_name, email, phone, dob, address, consent, created_at) VALUES
('Jane','Smith','jane@example.com','+44 7700 900123','1990-05-12','12 Crescent Rd, London',1, datetime('now')),
('Adam','Khan','adam.khan@example.com','+44 7555 220011','1987-02-09','Flat 5, Greenway',1, datetime('now','-1 day'));

INSERT INTO appointments (patient_id, service, clinician, start_at, status, notes, created_at) VALUES
(1,'Check-up','Dr. Omar', datetime('now','+1 day'),'booked','Sensitivity upper molar', datetime('now')),
(2,'Hygiene clean','Dr. Aisha', datetime('now','-2 day'),'completed','', datetime('now','-2 day'));
