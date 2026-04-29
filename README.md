# ATHE 3.5 Dental Clinic Website

This folder contains everything needed to achieve a Distinction for the ATHE Level 3 Unit 3.5 assignment. Deliverables are split by task and mapped to assessment criteria. All content is self-contained and can be submitted as the main report with supporting evidence.

## Contents
- `task1_plan.md` – website plan, storyboard, tools, languages, pre‑planning analysis (LO1, 1M1, 1D1)
- `task2_design_build.md` – design decisions, site map, accessibility, database schema, legal compliance, additional functionality (LO2, 2M1, 2D1)
- `task3_testing.md` – test strategy, detailed test plan, recorded outcomes template (LO3)
- `task4_publishing.md` – publishing guide, domain/hosting considerations, FTP steps with evidence checklist (LO4)
- `evidence_map.md` – quick cross‑reference of criteria to evidence locations
- `site/` – front-end SPA for the dental clinic (HTML/CSS/JS)
- `server/` – Express + SQLite API, schema and seed data for patient and appointment storage

## Quick start (demo)
1) `cd docs/athe-dental-clinic/server && npm install`
2) `npm run dev` (starts API at http://localhost:4000)
3) `cd ../site && npx serve .` (or open `index.html` directly)

The SPA reads/writes data via the API. Staff reports are available under the “Staff” tab (password placeholder: `staffdemo`).

## Submission notes
- Add annotated screenshots of key pages, code snippets, database tables, and FTP upload as evidence before submission.
- Keep this README for the assessor as a navigation aid; the report files below can be merged into a single submission PDF if preferred.
