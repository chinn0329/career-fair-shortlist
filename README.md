# Career Fair Eligibility Shortlist

A compact tool for a university placement team to evaluate one student's academic
profile and skills against a fixed list of career-fair roles, showing which roles
the student is eligible for and every failed rule for each ineligible role.

Built as part of an AI-assisted coding interview exercise (SI26_P06).

---

## Tech Stack

| Layer       | Choice                                  |
|-------------|------------------------------------------|
| UI          | React (functional components + hooks)   |
| Build tool  | Vite                                     |
| Styling     | Plain CSS (`styles.css`, custom properties) |
| Logic       | Plain JS, pure functions, no framework  |
| Testing     | Vitest                                   |

No backend, database, account system, or network service is used — the app runs
entirely client-side with a fixed local dataset, per the problem's constraints.

---

## Project Structure

```
career-fair-shortlist/
├── src/
│   ├── App.jsx          UI + component state
│   ├── eligibility.js   validation, normalization, and rule-evaluation logic
│   ├── data.js           default student profile + fixed role list
│   ├── styles.css        visual styling
│   └── main.jsx           app entry point (Vite default)
├── tests/
│   └── eligibility.test.js   automated tests for eligibility.js
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

The project is intentionally layered into **data → logic → UI**, so the
eligibility rules can be tested independently of any rendering code.

---

## Running the App

**Requirements:** Node.js (v18+) and npm installed.

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
```

This prints a local URL (typically `http://localhost:5173`). Open it in your
browser — the app hot-reloads as you edit source files.

---

## Running Tests

```bash
# Watch mode
npm run test

# Single run (CI-style, exits after completion)
npm run test:run
```

All eligibility, validation, and normalization logic is covered — 35 tests in
total, organized by function (`validateProfile`, `normalizeProfile`,
`evaluateRole`, `evaluateAllRoles`).

---

## Features

- **Editable student profile** — branch, CGPA, graduation year, active
  backlogs, and a comma-separated skills field
- **Five fixed career-fair roles**, shown as a read-only reference list
- **Evaluate** action — validates the profile, then checks it against every
  role independently
- **Eligible / Ineligible grouping**, sorted by role title (case-insensitive),
  then role ID
- **Full failure-reason breakdown** for every ineligible role, in a fixed
  order: `BRANCH_NOT_ALLOWED` → `CGPA_BELOW_MINIMUM` →
  `GRADUATION_YEAR_NOT_ALLOWED` → `TOO_MANY_ACTIVE_BACKLOGS` →
  `MISSING_SKILL: <skill>` (alphabetical among missing skills)
- **Validation messages** for invalid input (`INVALID_BRANCH`,
  `INVALID_CGPA`, `INVALID_GRADUATION_YEAR`, `INVALID_BACKLOG_COUNT`) —
  reports every invalid field at once, and clears any prior results
- **Load Sample** — loads the built-in profile and evaluates it immediately
- **Reset** — restores the built-in profile without auto-evaluating
- **Compact / Detailed view toggle** *(optional feature)* — a denser
  card-grid view of the same evaluation results, alongside the original
  full-detail list

---

## How Evaluation Works

A role is **ELIGIBLE** only when all of the following hold:

1. The student's branch is in the role's allowed branch set
2. CGPA is greater than or equal to the role's minimum
3. Graduation year is in the role's allowed set
4. Active backlogs are less than or equal to the role's maximum
5. Every required skill is present in the student's skill list

Every rule is evaluated independently — an ineligible role lists **all**
failed rules, not just the first one encountered.

---

## Input Normalization

- Branch and skills are trimmed of surrounding whitespace
- Branch and skills are compared case-insensitively (no aliasing — "CS" is
  never treated as "CSE")
- Skills are entered as a single comma-separated string, split on commas,
  with empty pieces removed and duplicates collapsed (case-insensitive)

## Input Validation

| Field             | Rule                                        |
|--------------------|----------------------------------------------|
| Branch             | Non-blank after trimming                     |
| CGPA                | Finite number, 0–10 inclusive                |
| Graduation year     | Whole number, 2000–2100 inclusive            |
| Active backlogs     | Whole number, ≥ 0                            |

If any field is invalid, all applicable error codes are reported together,
and any previously displayed results and counts are cleared.

---

## Design Notes

- **Logic is fully decoupled from the UI.** `eligibility.js` has no
  dependency on React and is testable in complete isolation — this is what
  allowed the entire rule engine to be verified before any UI code was
  written.
- **No live validation while typing.** Editing a form field only updates
  local state; validation, normalization, and evaluation only run when
  **Evaluate** is clicked. This keeps the results panel stable while editing
  and matches the spec's explicit "Evaluate action."
- **Sample vs. Reset are intentionally different.** Load Sample loads the
  built-in profile *and* evaluates it immediately, since the acceptance
  criteria describes loading the sample as producing visible results in one
  action. Reset restores the built-in profile but does **not** auto-evaluate,
  clearing prior results/validation until Evaluate is run again.
- **The compact view is additive, not a replacement.** It reads from the same
  evaluation result as the detailed view — no new logic, no new sorting, just
  a denser presentation for quick scanning.

---

## Known Assumptions

- If multiple profile fields are invalid at once, **all** applicable error
  codes are shown together (not just the first one encountered), since the
  spec does not explicitly restrict this to a single message.