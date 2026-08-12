// tests/eligibility.test.js

import { describe, test, expect } from "vitest";

import {
  validateProfile,
  normalizeProfile,
  evaluateRole,
  evaluateAllRoles
} from "../src/eligibility.js";

import { defaultStudent, roles } from "../src/data.js";


// ============================================================
// TEST HELPERS
// ============================================================

const getRole = id => roles.find(role => role.id === id);


// ============================================================
// 1. validateProfile()
// ============================================================

describe("validateProfile()", () => {

  test("accepts the default student profile", () => {
    const result = validateProfile(defaultStudent);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });


  test("rejects a blank branch", () => {
    const student = {
      ...defaultStudent,
      branch: "   "
    };

    const result = validateProfile(student);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("INVALID_BRANCH");
  });


  test("rejects CGPA below 0", () => {
    const result = validateProfile({
      ...defaultStudent,
      cgpa: -1
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("INVALID_CGPA");
  });


  test("rejects CGPA above 10", () => {
    const result = validateProfile({
      ...defaultStudent,
      cgpa: 10.5
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("INVALID_CGPA");
  });


  test("accepts CGPA boundary values 0 and 10", () => {
    const zeroCgpa = validateProfile({
      ...defaultStudent,
      cgpa: 0
    });

    const tenCgpa = validateProfile({
      ...defaultStudent,
      cgpa: 10
    });

    expect(zeroCgpa.valid).toBe(true);
    expect(tenCgpa.valid).toBe(true);
  });


  test("rejects graduation year below 2000", () => {
    const result = validateProfile({
      ...defaultStudent,
      graduationYear: 1999
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("INVALID_GRADUATION_YEAR");
  });


  test("rejects graduation year above 2100", () => {
    const result = validateProfile({
      ...defaultStudent,
      graduationYear: 2101
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("INVALID_GRADUATION_YEAR");
  });


  test("rejects non-whole graduation year", () => {
    const result = validateProfile({
      ...defaultStudent,
      graduationYear: 2027.5
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("INVALID_GRADUATION_YEAR");
  });


  test("rejects negative active backlog count", () => {
    const result = validateProfile({
      ...defaultStudent,
      activeBacklogs: -1
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("INVALID_BACKLOG_COUNT");
  });


  test("rejects fractional active backlog count", () => {
    const result = validateProfile({
      ...defaultStudent,
      activeBacklogs: 1.5
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("INVALID_BACKLOG_COUNT");
  });


  test("reports multiple invalid fields together", () => {
    const student = {
      ...defaultStudent,
      branch: "",
      cgpa: 11,
      graduationYear: 1999,
      activeBacklogs: -1
    };

    const result = validateProfile(student);

    expect(result.valid).toBe(false);

    expect(result.errors).toEqual([
      "INVALID_BRANCH",
      "INVALID_CGPA",
      "INVALID_GRADUATION_YEAR",
      "INVALID_BACKLOG_COUNT"
    ]);
  });
});


// ============================================================
// 2. normalizeProfile()
// ============================================================

describe("normalizeProfile()", () => {

  test("trims and uppercases the branch", () => {
    const student = {
      ...defaultStudent,
      branch: "  cse  "
    };

    const result = normalizeProfile(student);

    expect(result.branch).toBe("CSE");
  });


  test("splits comma-separated skills", () => {
    const student = {
      ...defaultStudent,
      skills: "Git, Python, SQL"
    };

    const result = normalizeProfile(student);

    expect(result.skills).toEqual([
      "git",
      "python",
      "sql"
    ]);
  });


  test("trims and lowercases skills", () => {
    const student = {
      ...defaultStudent,
      skills: " Git , PYTHON , Sql "
    };

    const result = normalizeProfile(student);

    expect(result.skills).toEqual([
      "git",
      "python",
      "sql"
    ]);
  });


  test("removes empty skills", () => {
    const student = {
      ...defaultStudent,
      skills: "Git, , Python,   , SQL"
    };

    const result = normalizeProfile(student);

    expect(result.skills).toEqual([
      "git",
      "python",
      "sql"
    ]);
  });


  test("removes duplicate skills case-insensitively", () => {
    const student = {
      ...defaultStudent,
      skills: "Git, git, GIT, Python, PYTHON"
    };

    const result = normalizeProfile(student);

    expect(result.skills).toEqual([
      "git",
      "python"
    ]);
  });


  test("handles skills containing extra commas", () => {
    const student = {
      ...defaultStudent,
      skills: ",Git,,Python,,,SQL,"
    };

    const result = normalizeProfile(student);

    expect(result.skills).toEqual([
      "git",
      "python",
      "sql"
    ]);
  });


  test("does not modify the original student object", () => {
    const student = {
      ...defaultStudent,
      branch: " cse ",
      skills: " Git, Python "
    };

    normalizeProfile(student);

    expect(student.branch).toBe(" cse ");
    expect(student.skills).toBe(" Git, Python ");
  });

  test("converts numeric profile fields from strings to numbers", () => {
  const student = {
    ...defaultStudent,
    cgpa: "8.1",
    graduationYear: "2027",
    activeBacklogs: "1",
    skills: "Git, Python, SQL"
  };

  const result = normalizeProfile(student);

  expect(result.cgpa).toBe(8.1);
  expect(result.graduationYear).toBe(2027);
  expect(result.activeBacklogs).toBe(1);

  expect(typeof result.cgpa).toBe("number");
  expect(typeof result.graduationYear).toBe("number");
  expect(typeof result.activeBacklogs).toBe("number");
});
});


// ============================================================
// 3. evaluateRole()
// ============================================================

describe("evaluateRole()", () => {

  test("marks CF01 as eligible for the default student", () => {
    const student = normalizeProfile(defaultStudent);
    const role = getRole("CF01");

    const result = evaluateRole(student, role);

    expect(result.status).toBe("ELIGIBLE");
    expect(result.failureReasons).toEqual([]);
  });


  test("CF03 fails only because of branch", () => {
    const student = normalizeProfile(defaultStudent);
    const role = getRole("CF03");

    const result = evaluateRole(student, role);

    expect(result.status).toBe("INELIGIBLE");

    expect(result.failureReasons).toEqual([
      "BRANCH_NOT_ALLOWED"
    ]);
  });


  test("CF04 fails only because of CGPA", () => {
    const student = normalizeProfile(defaultStudent);
    const role = getRole("CF04");

    const result = evaluateRole(student, role);

    expect(result.status).toBe("INELIGIBLE");

    expect(result.failureReasons).toEqual([
      "CGPA_BELOW_MINIMUM"
    ]);
  });


  test("CF05 reports all required failures in the correct order", () => {
    const student = normalizeProfile(defaultStudent);
    const role = getRole("CF05");

    const result = evaluateRole(student, role);

    expect(result.status).toBe("INELIGIBLE");

    expect(result.failureReasons).toEqual([
      "GRADUATION_YEAR_NOT_ALLOWED",
      "TOO_MANY_ACTIVE_BACKLOGS",
      "MISSING_SKILL: Docker"
    ]);
  });


  test("CGPA exactly equal to minimum is accepted", () => {
    const student = normalizeProfile({
      ...defaultStudent,
      cgpa: 8.5
    });

    const role = getRole("CF04");

    const result = evaluateRole(student, role);

    expect(result.status).toBe("ELIGIBLE");
    expect(result.failureReasons).toEqual([]);
  });


  test("skill comparison is case-insensitive", () => {
    const student = normalizeProfile({
      ...defaultStudent,
      skills: "GIT, PYTHON, SQL"
    });

    const role = getRole("CF01");

    const result = evaluateRole(student, role);

    expect(result.status).toBe("ELIGIBLE");
    expect(result.failureReasons).toEqual([]);
  });


  test("missing skill preserves the role's original casing", () => {
    const student = normalizeProfile({
      ...defaultStudent,
      skills: "Git, SQL"
    });

    const role = {
      ...getRole("CF01"),
      requiredSkills: ["Python"]
    };

    const result = evaluateRole(student, role);

    expect(result.failureReasons).toEqual([
      "MISSING_SKILL: Python"
    ]);
  });


  test("multiple missing skills are sorted alphabetically", () => {
    // CF05 requirements:
    // Branch: CSE/ECE
    // CGPA: >= 7.0
    // Graduation Year: 2026
    // Backlogs: <= 0
    //
    // We satisfy all non-skill requirements so that
    // this test specifically checks missing-skill ordering.

    const student = normalizeProfile({
      ...defaultStudent,
      branch: "CSE",
      cgpa: 8.1,
      graduationYear: 2026,
      activeBacklogs: 0,
      skills: ""
    });

    const role = {
      ...getRole("CF05"),
      requiredSkills: ["Git", "Docker"]
    };

    const result = evaluateRole(student, role);

    expect(result.status).toBe("INELIGIBLE");

    expect(result.failureReasons).toEqual([
      "MISSING_SKILL: Docker",
      "MISSING_SKILL: Git"
    ]);
  });


  test("all independent rules are evaluated", () => {
    const student = normalizeProfile({
      branch: "IT",
      cgpa: 6.0,
      graduationYear: 2027,
      activeBacklogs: 2,
      skills: ""
    });

    const role = getRole("CF05");

    const result = evaluateRole(student, role);

    expect(result.failureReasons).toEqual([
      "BRANCH_NOT_ALLOWED",
      "CGPA_BELOW_MINIMUM",
      "GRADUATION_YEAR_NOT_ALLOWED",
      "TOO_MANY_ACTIVE_BACKLOGS",
      "MISSING_SKILL: Docker",
      "MISSING_SKILL: Git"
    ]);
  });
});


// ============================================================
// 4. evaluateAllRoles()
// ============================================================

describe("evaluateAllRoles()", () => {

  test("default profile produces exactly 2 eligible and 3 ineligible roles", () => {
    const student = normalizeProfile(defaultStudent);

    const result = evaluateAllRoles(student, roles);

    expect(result.eligibleCount).toBe(2);
    expect(result.ineligibleCount).toBe(3);
  });


  test("default profile produces the expected role statuses", () => {
    const student = normalizeProfile(defaultStudent);

    const result = evaluateAllRoles(student, roles);

    expect(
      result.results.map(role => ({
        id: role.roleId,
        status: role.status
      }))
    ).toEqual([
      { id: "CF01", status: "ELIGIBLE" },
      { id: "CF02", status: "ELIGIBLE" },
      { id: "CF03", status: "INELIGIBLE" },
      { id: "CF04", status: "INELIGIBLE" },
      { id: "CF05", status: "INELIGIBLE" }
    ]);
  });


  test("eligible roles appear before ineligible roles", () => {
    const student = normalizeProfile(defaultStudent);

    const result = evaluateAllRoles(student, roles);

    const statuses = result.results.map(result => result.status);

    expect(statuses).toEqual([
      "ELIGIBLE",
      "ELIGIBLE",
      "INELIGIBLE",
      "INELIGIBLE",
      "INELIGIBLE"
    ]);
  });


  test("CGPA 8.5 makes CF04 eligible", () => {
    const student = normalizeProfile({
      ...defaultStudent,
      cgpa: 8.5
    });

    const result = evaluateAllRoles(student, roles);

    expect(result.eligibleCount).toBe(3);
    expect(result.ineligibleCount).toBe(2);

    expect(
      result.results
        .filter(result => result.status === "ELIGIBLE")
        .map(result => result.roleId)
    ).toEqual([
      "CF01",
      "CF04",
      "CF02"
    ]);
  });


  test("role titles are sorted alphabetically within each group", () => {
    const student = normalizeProfile({
      ...defaultStudent,
      cgpa: 8.5
    });

    const result = evaluateAllRoles(student, roles);

    const eligibleTitles = result.results
      .filter(result => result.status === "ELIGIBLE")
      .map(result => result.roleTitle);

    expect(eligibleTitles).toEqual([
      "Data Operations Intern",
      "Machine Learning Intern",
      "QA Automation Intern"
    ]);
  });


  test("returns an empty result for an empty role list", () => {
    const student = normalizeProfile(defaultStudent);

    const result = evaluateAllRoles(student, []);

    expect(result.results).toEqual([]);
    expect(result.eligibleCount).toBe(0);
    expect(result.ineligibleCount).toBe(0);
  });
});

// ============================================================
// 5. FULL ELIGIBILITY PIPELINE
// ============================================================

describe("Full eligibility pipeline", () => {

  test("executes validate -> normalize -> evaluate correctly", () => {
    // Raw input as it would come from the UI
    const rawStudent = {
      branch: " cse ",
      cgpa: "8.1",
      graduationYear: "2027",
      activeBacklogs: "1",
      skills: "Git, Python, SQL"
    };

    // --------------------------------------------------------
    // Step 1: Validate
    // --------------------------------------------------------
    const validationResult = validateProfile(rawStudent);

    expect(validationResult.valid).toBe(true);
    expect(validationResult.errors).toEqual([]);

    // --------------------------------------------------------
    // Step 2: Normalize
    // --------------------------------------------------------
    const normalizedStudent = normalizeProfile(rawStudent);

    expect(normalizedStudent).toEqual({
      branch: "CSE",
      cgpa: 8.1,
      graduationYear: 2027,
      activeBacklogs: 1,
      skills: ["git", "python", "sql"]
    });

    // --------------------------------------------------------
    // Step 3: Evaluate
    // --------------------------------------------------------
    const evaluationResult = evaluateAllRoles(
      normalizedStudent,
      roles
    );

    expect(evaluationResult.eligibleCount).toBe(2);
    expect(evaluationResult.ineligibleCount).toBe(3);

    expect(
      evaluationResult.results.map(result => result.roleId)
    ).toEqual([
      "CF01",
      "CF02",
      "CF03",
      "CF04",
      "CF05"
    ]);
  });
});