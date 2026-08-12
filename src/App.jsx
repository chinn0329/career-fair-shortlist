import { useState } from "react";
import {
  validateProfile,
  normalizeProfile,
  evaluateAllRoles
} from "./eligibility.js";
import { defaultStudent, roles } from "./data.js";

function App() {
  // ----------------------------------------------------------
  // Initial form state
  // All form fields are kept as strings because they are
  // controlled directly by the UI inputs.
  // ----------------------------------------------------------

  const initialFormValues = {
    branch: String(defaultStudent.branch ?? ""),
    cgpa: String(defaultStudent.cgpa ?? ""),
    graduationYear: String(defaultStudent.graduationYear ?? ""),
    activeBacklogs: String(defaultStudent.activeBacklogs ?? ""),
    skills: String(defaultStudent.skills ?? "")
  };

  const [formValues, setFormValues] = useState(initialFormValues);
  const [validationErrors, setValidationErrors] = useState([]);
  const [evaluationResult, setEvaluationResult] = useState(null);

  // ----------------------------------------------------------
  // Convert the built-in profile into the string-based form
  // representation required by the UI.
  // ----------------------------------------------------------

  const getDefaultFormValues = () => ({
    branch: String(defaultStudent.branch ?? ""),
    cgpa: String(defaultStudent.cgpa ?? ""),
    graduationYear: String(defaultStudent.graduationYear ?? ""),
    activeBacklogs: String(defaultStudent.activeBacklogs ?? ""),
    skills: String(defaultStudent.skills ?? "")
  });

  // ----------------------------------------------------------
  // Handle form editing
  //
  // Deliberately ONLY updates formValues.
  // No validation, normalization, or evaluation happens here.
  // ----------------------------------------------------------

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormValues((previousValues) => ({
      ...previousValues,
      [name]: value
    }));
  };

  // ----------------------------------------------------------
  // Evaluate
  //
  // Pipeline:
  // validate → normalize → evaluate
  // ----------------------------------------------------------

  const handleEvaluate = () => {
    const validationResult = validateProfile(formValues);

    if (!validationResult.valid) {
      setValidationErrors(validationResult.errors);
      setEvaluationResult(null);
      return;
    }

    setValidationErrors([]);

    const normalizedStudent = normalizeProfile(formValues);

    const result = evaluateAllRoles(
      normalizedStudent,
      roles
    );

    setEvaluationResult(result);
  };

  // ----------------------------------------------------------
  // Load Sample
  //
  // Loads the built-in profile AND immediately evaluates it.
  // ----------------------------------------------------------

  const handleSample = () => {
    const sampleFormValues = getDefaultFormValues();

    setFormValues(sampleFormValues);
    setValidationErrors([]);

    const normalizedStudent = normalizeProfile(
      defaultStudent
    );

    const result = evaluateAllRoles(
      normalizedStudent,
      roles
    );

    setEvaluationResult(result);
  };

  // ----------------------------------------------------------
  // Reset
  //
  // Restores the built-in profile but deliberately does NOT
  // evaluate it.
  // ----------------------------------------------------------

  const handleReset = () => {
    setFormValues(getDefaultFormValues());
    setValidationErrors([]);
    setEvaluationResult(null);
  };

  return (
    <div className="app">

      {/* ======================================================
          HEADER
          ====================================================== */}

      <header>
        <h1>Career Fair Eligibility Shortlist</h1>
        <p>
          Evaluate a student profile against the available
          career fair roles.
        </p>
      </header>


      {/* ======================================================
          STUDENT PROFILE
          ====================================================== */}

      <section>
        <h2>Student Profile</h2>

        <div>
          <label htmlFor="branch">
            Branch
          </label>

          <input
            id="branch"
            name="branch"
            type="text"
            value={formValues.branch}
            onChange={handleChange}
            placeholder="e.g. CSE"
          />
        </div>


        <div>
          <label htmlFor="cgpa">
            CGPA
          </label>

          <input
            id="cgpa"
            name="cgpa"
            type="text"
            value={formValues.cgpa}
            onChange={handleChange}
            placeholder="e.g. 8.1"
          />
        </div>


        <div>
          <label htmlFor="graduationYear">
            Graduation Year
          </label>

          <input
            id="graduationYear"
            name="graduationYear"
            type="text"
            value={formValues.graduationYear}
            onChange={handleChange}
            placeholder="e.g. 2027"
          />
        </div>


        <div>
          <label htmlFor="activeBacklogs">
            Active Backlogs
          </label>

          <input
            id="activeBacklogs"
            name="activeBacklogs"
            type="text"
            value={formValues.activeBacklogs}
            onChange={handleChange}
            placeholder="e.g. 0"
          />
        </div>


        <div>
          <label htmlFor="skills">
            Skills
          </label>

          <input
            id="skills"
            name="skills"
            type="text"
            value={formValues.skills}
            onChange={handleChange}
            placeholder="e.g. Git, Python, SQL"
          />

          <small>
            Enter skills separated by commas.
          </small>
        </div>
      </section>


      {/* ======================================================
          ACTION BUTTONS
          ====================================================== */}

      <section>
        <button type="button" onClick={handleEvaluate}>
          Evaluate
        </button>

        <button type="button" onClick={handleSample}>
          Load Sample
        </button>

        <button type="button" onClick={handleReset}>
          Reset
        </button>
      </section>


      {/* ======================================================
          VALIDATION ERRORS
          ====================================================== */}

      {validationErrors.length > 0 && (
        <section>
          <h2>Validation Errors</h2>

          <ul>
            {validationErrors.map((error, index) => (
              <li key={`${error}-${index}`}>
                {error}
              </li>
            ))}
          </ul>
        </section>
      )}


      {/* ======================================================
          FIXED ROLE REQUIREMENTS
          ====================================================== */}

      <section>
        <h2>Available Career Fair Roles</h2>

        {roles.map((role) => (
          <article key={role.id}>
            <h3>
              {role.id} — {role.title}
            </h3>

            <p>
              <strong>Allowed Branches:</strong>{" "}
              {role.allowedBranches.join(", ")}
            </p>

            <p>
              <strong>Minimum CGPA:</strong>{" "}
              {role.minimumCgpa}
            </p>

            <p>
              <strong>Graduation Years:</strong>{" "}
              {role.allowedGraduationYears.join(", ")}
            </p>

            <p>
              <strong>Maximum Active Backlogs:</strong>{" "}
              {role.maximumActiveBacklogs}
            </p>

            <p>
              <strong>Required Skills:</strong>{" "}
              {role.requiredSkills.join(", ")}
            </p>
          </article>
        ))}
      </section>


      {/* ======================================================
          EVALUATION RESULTS
          ====================================================== */}

      {evaluationResult !== null && (
        <section>
          <h2>Evaluation Results</h2>

          <div>
            <strong>
              Eligible: {evaluationResult.eligibleCount}
            </strong>

            {" | "}

            <strong>
              Ineligible: {evaluationResult.ineligibleCount}
            </strong>
          </div>


          <div>
            {evaluationResult.results.map((result) => (
              <article key={result.roleId}>

                <h3>
                  {result.roleId} — {result.roleTitle}
                </h3>

                <p>
                  <strong>Status:</strong>{" "}
                  {result.status}
                </p>

                {result.status === "INELIGIBLE" &&
                  result.failureReasons.length > 0 && (
                    <div>
                      <strong>Failure Reasons:</strong>

                      <ul>
                        {result.failureReasons.map(
                          (reason, index) => (
                            <li
                              key={`${result.roleId}-${reason}-${index}`}
                            >
                              {reason}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
              </article>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}

export default App;