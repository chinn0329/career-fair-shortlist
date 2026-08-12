// src/eligibility.js

/**
 * Validates the student's profile according to the problem specification.
 *
 * Validation rules:
 * - Branch must not be blank.
 * - CGPA must be a finite number from 0 through 10.
 * - Graduation year must be a whole number from 2000 through 2100.
 * - Active backlogs must be a whole number >= 0.
 *
 * @param {Object} student
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateProfile(student) {
  const errors = [];

  // -------------------------
  // Branch validation
  // -------------------------
  if (
    student.branch === undefined ||
    student.branch === null ||
    String(student.branch).trim() === ""
  ) {
    errors.push("INVALID_BRANCH");
  }

  // -------------------------
  // CGPA validation
  // -------------------------
  const cgpa = Number(student.cgpa);

  if (
    student.cgpa === undefined ||
    student.cgpa === null ||
    String(student.cgpa).trim() === "" ||
    !Number.isFinite(cgpa) ||
    cgpa < 0 ||
    cgpa > 10
  ) {
    errors.push("INVALID_CGPA");
  }

  // -------------------------
  // Graduation year validation
  // -------------------------
  const graduationYear = Number(student.graduationYear);

  if (
    student.graduationYear === undefined ||
    student.graduationYear === null ||
    String(student.graduationYear).trim() === "" ||
    !Number.isInteger(graduationYear) ||
    graduationYear < 2000 ||
    graduationYear > 2100
  ) {
    errors.push("INVALID_GRADUATION_YEAR");
  }

  // -------------------------
  // Active backlog validation
  // -------------------------
  const activeBacklogs = Number(student.activeBacklogs);

  if (
    student.activeBacklogs === undefined ||
    student.activeBacklogs === null ||
    String(student.activeBacklogs).trim() === "" ||
    !Number.isInteger(activeBacklogs) ||
    activeBacklogs < 0
  ) {
    errors.push("INVALID_BACKLOG_COUNT");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}



////previous normalize function, took skills as a array, whereas the new one takes skills as a string and splits it into an array of skills
/**
 * Normalizes a student profile for eligibility comparison.
 *
 * Rules:
 * - Trim surrounding whitespace from branch.
 * - Convert branch to uppercase.
 * - Trim skills.
 * - Convert skills to lowercase.
 * - Ignore empty skills.
 * - Remove duplicate skills.
 *
 * @param {Object} student
 * @returns {Object} normalized student profile
 *
export function normalizeProfile(student) {
  const normalizedBranch =
    typeof student.branch === "string"
      ? student.branch.trim().toUpperCase()
      : student.branch;

  const normalizedSkills = Array.isArray(student.skills)
    ? [...new Set(
        student.skills
          .filter(skill => typeof skill === "string")
          .map(skill => skill.trim().toLowerCase())
          .filter(skill => skill !== "")
      )]
    : [];

  return {
    ...student,
    branch: normalizedBranch,
    skills: normalizedSkills
  };
}
/


/**
 * Normalizes a student profile for eligibility comparison.
 *
 * Rules:
 * - Trim surrounding whitespace from branch.
 * - Convert branch to uppercase.
 * - Split comma-separated skills.
 * - Trim each skill.
 * - Convert skills to lowercase.
 * - Ignore empty skills.
 * - Remove duplicate skills.
 *
 * @param {Object} student
 * @returns {Object} normalized student profile
 *
export function normalizeProfile(student) {
  const normalizedBranch =
    typeof student.branch === "string"
      ? student.branch.trim().toUpperCase()
      : student.branch;

  const normalizedSkills =
    typeof student.skills === "string"
      ? [
          ...new Set(
            student.skills
              .split(",")
              .map(skill => skill.trim().toLowerCase())
              .filter(skill => skill !== "")
          )
        ]
      : [];

  return {
    ...student,
    branch: normalizedBranch,
    skills: normalizedSkills
  };
}

/
/**
 * Normalizes a student profile for eligibility comparison.
 *
 * IMPORTANT:
 * This function expects the profile to have already passed
 * validateProfile().
 *
 * Rules:
 * - Trim surrounding whitespace from branch.
 * - Convert branch to uppercase.
 * - Convert CGPA to a number.
 * - Convert graduation year to a number.
 * - Convert active backlogs to a number.
 * - Split comma-separated skills.
 * - Trim each skill.
 * - Convert skills to lowercase.
 * - Ignore empty skills.
 * - Remove duplicate skills.
 *
 * @param {Object} student
 * @returns {Object} normalized student profile
 */
export function normalizeProfile(student) {
  // --------------------------------
  // Branch normalization
  // --------------------------------
  const normalizedBranch =
    typeof student.branch === "string"
      ? student.branch.trim().toUpperCase()
      : student.branch;

  // --------------------------------
  // Numeric normalization
  // --------------------------------
  const normalizedCgpa = Number(student.cgpa);

  const normalizedGraduationYear = Number(
    student.graduationYear
  );

  const normalizedActiveBacklogs = Number(
    student.activeBacklogs
  );

  // --------------------------------
  // Skills normalization
  // --------------------------------
  const normalizedSkills =
    typeof student.skills === "string"
      ? [
          ...new Set(
            student.skills
              .split(",")
              .map(skill => skill.trim().toLowerCase())
              .filter(skill => skill !== "")
          )
        ]
      : [];

  return {
    ...student,
    branch: normalizedBranch,
    cgpa: normalizedCgpa,
    graduationYear: normalizedGraduationYear,
    activeBacklogs: normalizedActiveBacklogs,
    skills: normalizedSkills
  };
}
/**
 * Evaluates a normalized student against one role.
 *
 * Every eligibility rule is evaluated independently.
 * All failed rules are collected in the required order.
 *
 * @param {Object} student - Normalized student profile
 * @param {Object} role - Role requirement
 * @returns {{
 *   roleId: string,
 *   roleTitle: string,
 *   status: string,
 *   failureReasons: string[]
 * }}
 */
export function evaluateRole(student, role) {
  const failureReasons = [];

  // --------------------------------
  // 1. Branch rule
  // --------------------------------
  const branchAllowed = role.allowedBranches
    .map(branch => branch.trim().toUpperCase())
    .includes(student.branch);

  if (!branchAllowed) {
    failureReasons.push("BRANCH_NOT_ALLOWED");
  }

  // --------------------------------
  // 2. CGPA rule
  // --------------------------------
  if (student.cgpa < role.minimumCgpa) {
    failureReasons.push("CGPA_BELOW_MINIMUM");
  }

  // --------------------------------
  // 3. Graduation year rule
  // --------------------------------
  if (!role.allowedGraduationYears.includes(student.graduationYear)) {
    failureReasons.push("GRADUATION_YEAR_NOT_ALLOWED");
  }

  // --------------------------------
  // 4. Active backlog rule
  // --------------------------------
  if (student.activeBacklogs > role.maximumActiveBacklogs) {
    failureReasons.push("TOO_MANY_ACTIVE_BACKLOGS");
  }

  // --------------------------------
  // 5. Required skills rule
  // --------------------------------
  // Student skills are already normalized to lowercase.
  // Required skills retain their original casing for reporting.
  const studentSkills = new Set(student.skills);

  const missingSkills = role.requiredSkills
    .filter(skill => !studentSkills.has(skill.trim().toLowerCase()))
    .sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" })
    );

  for (const skill of missingSkills) {
    failureReasons.push(`MISSING_SKILL: ${skill.trim()}`);
  }

  return {
    roleId: role.id,
    roleTitle: role.title,
    status: failureReasons.length === 0 ? "ELIGIBLE" : "INELIGIBLE",
    failureReasons
  };
}

/**
 * Evaluates a normalized student against all available roles.
 *
 * Rules:
 * - Every role is evaluated independently.
 * - Eligible roles appear first.
 * - Ineligible roles appear second.
 * - Within each group, roles are sorted by title
 *   case-insensitively, then by role ID.
 *
 * @param {Object} student - Normalized student profile
 * @param {Array<Object>} roles - Fixed role requirements
 * @returns {{
 *   results: Array<Object>,
 *   eligibleCount: number,
 *   ineligibleCount: number
 * }}
 */
export function evaluateAllRoles(student, roles) {
  // Evaluate every role independently.
  const results = roles.map(role => evaluateRole(student, role));

  // Separate eligible and ineligible roles.
  const eligibleResults = results.filter(
    result => result.status === "ELIGIBLE"
  );

  const ineligibleResults = results.filter(
    result => result.status === "INELIGIBLE"
  );

  // Sort each group by role title, case-insensitive.
  // Role ID is used as the tie-breaker.
  const sortResults = (a, b) => {
    const titleComparison = a.roleTitle.localeCompare(
      b.roleTitle,
      undefined,
      { sensitivity: "base" }
    );

    if (titleComparison !== 0) {
      return titleComparison;
    }

    return a.roleId.localeCompare(b.roleId);
  };

  eligibleResults.sort(sortResults);
  ineligibleResults.sort(sortResults);

  // Eligible roles must appear before ineligible roles.
  const orderedResults = [
    ...eligibleResults,
    ...ineligibleResults
  ];

  return {
    results: orderedResults,
    eligibleCount: eligibleResults.length,
    ineligibleCount: ineligibleResults.length
  };
}

