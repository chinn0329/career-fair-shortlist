import { useState } from "react";
import {
  validateProfile,
  normalizeProfile,
  evaluateAllRoles
} from "./eligibility.js";
import { defaultStudent, roles } from "./data.js";
import "./styles.css";

function App() {
  const getDefaultFormValues = () => ({
    branch: String(defaultStudent.branch ?? ""),
    cgpa: String(defaultStudent.cgpa ?? ""),
    graduationYear: String(defaultStudent.graduationYear ?? ""),
    activeBacklogs: String(defaultStudent.activeBacklogs ?? ""),
    skills: String(defaultStudent.skills ?? "")
  });

  const [formValues, setFormValues] = useState(getDefaultFormValues);
  const [validationErrors, setValidationErrors] = useState([]);
  const [evaluationResult, setEvaluationResult] = useState(null);
  // NEW: purely a presentation toggle, does not affect evaluationResult
  const [viewMode, setViewMode] = useState("detailed"); // "detailed" | "compact"

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((previousValues) => ({
      ...previousValues,
      [name]: value
    }));
  };

  const handleEvaluate = () => {
    const validationResult = validateProfile(formValues);

    if (!validationResult.valid) {
      setValidationErrors(validationResult.errors);
      setEvaluationResult(null);
      return;
    }

    setValidationErrors([]);
    const normalizedStudent = normalizeProfile(formValues);
    const result = evaluateAllRoles(normalizedStudent, roles);
    setEvaluationResult(result);
  };

  const handleSample = () => {
    setFormValues(getDefaultFormValues());
    setValidationErrors([]);
    const normalizedStudent = normalizeProfile(defaultStudent);
    const result = evaluateAllRoles(normalizedStudent, roles);
    setEvaluationResult(result);
  };

  const handleReset = () => {
    setFormValues(getDefaultFormValues());
    setValidationErrors([]);
    setEvaluationResult(null);
  };

  return (
    <div className="app">
      <header>
        <h1>Career Fair Eligibility Shortlist</h1>
        <p>Evaluate a student profile against the available career fair roles.</p>
      </header>

      <div className="layout">
        {/* LEFT COLUMN: profile + controls */}
        <div>
          <section>
            <h2>Student Profile</h2>

            <div className="field">
              <label htmlFor="branch">Branch</label>
              <input
                id="branch"
                name="branch"
                type="text"
                value={formValues.branch}
                onChange={handleChange}
                placeholder="e.g. CSE"
              />
            </div>

            <div className="field">
              <label htmlFor="cgpa">CGPA</label>
              <input
                id="cgpa"
                name="cgpa"
                type="text"
                value={formValues.cgpa}
                onChange={handleChange}
                placeholder="e.g. 8.1"
              />
            </div>

            <div className="field">
              <label htmlFor="graduationYear">Graduation Year</label>
              <input
                id="graduationYear"
                name="graduationYear"
                type="text"
                value={formValues.graduationYear}
                onChange={handleChange}
                placeholder="e.g. 2027"
              />
            </div>

            <div className="field">
              <label htmlFor="activeBacklogs">Active Backlogs</label>
              <input
                id="activeBacklogs"
                name="activeBacklogs"
                type="text"
                value={formValues.activeBacklogs}
                onChange={handleChange}
                placeholder="e.g. 0"
              />
            </div>

            <div className="field">
              <label htmlFor="skills">Skills</label>
              <input
                id="skills"
                name="skills"
                type="text"
                value={formValues.skills}
                onChange={handleChange}
                placeholder="e.g. Git, Python, SQL"
              />
              <small>Enter skills separated by commas.</small>
            </div>
          </section>

          <section>
            <div className="actions">
              <button type="button" className="btn-primary" onClick={handleEvaluate}>
                Evaluate
              </button>
              <button type="button" className="btn-secondary" onClick={handleSample}>
                Load Sample
              </button>
              <button type="button" className="btn-secondary" onClick={handleReset}>
                Reset
              </button>
            </div>
          </section>

          {validationErrors.length > 0 && (
            <section className="validation-panel">
              <h2>Validation Errors</h2>
              <ul>
                {validationErrors.map((error, index) => (
                  <li key={`${error}-${index}`}>{error}</li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* RIGHT COLUMN: results (if any) + roles reference */}
        <div>
          {evaluationResult !== null && (
            <section>
              <div className="results-head">
                <h2>Evaluation Results</h2>

                {/* NEW: view toggle — purely presentational, same evaluationResult */}
                <div className="view-toggle" role="group" aria-label="Results view">
                  <button
                    type="button"
                    className={viewMode === "detailed" ? "toggle-btn active" : "toggle-btn"}
                    onClick={() => setViewMode("detailed")}
                  >
                    Detailed
                  </button>
                  <button
                    type="button"
                    className={viewMode === "compact" ? "toggle-btn active" : "toggle-btn"}
                    onClick={() => setViewMode("compact")}
                  >
                    Compact
                  </button>
                </div>
              </div>

              <div className="counts">
                <div className="count-chip eligible">
                  <span className="num">{evaluationResult.eligibleCount}</span>
                  Eligible
                </div>
                <div className="count-chip ineligible">
                  <span className="num">{evaluationResult.ineligibleCount}</span>
                  Ineligible
                </div>
              </div>

              {viewMode === "detailed" ? (
                evaluationResult.results.map((result) => {
                  const isEligible = result.status === "ELIGIBLE";
                  return (
                    <div
                      key={result.roleId}
                      className={`result-card ${isEligible ? "eligible" : "ineligible"}`}
                    >
                      <div className="result-card-head">
                        <h3>
                          <span className="role-id">{result.roleId}</span>
                          {result.roleTitle}
                        </h3>
                        <span
                          className={`status-tag ${isEligible ? "eligible" : "ineligible"}`}
                        >
                          {result.status}
                        </span>
                      </div>

                      {!isEligible && result.failureReasons.length > 0 && (
                        <ul className="failure-reasons">
                          {result.failureReasons.map((reason, index) => (
                            <li key={`${result.roleId}-${reason}-${index}`}>{reason}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="compact-grid">
                  {evaluationResult.results.map((result) => {
                    const isEligible = result.status === "ELIGIBLE";
                    return (
                      <div
                        key={result.roleId}
                        className={`compact-card ${isEligible ? "eligible" : "ineligible"}`}
                      >
                        <span className="compact-role-id">{result.roleId}</span>
                        <span className="compact-role-title">{result.roleTitle}</span>
                        <span
                          className={`status-tag ${isEligible ? "eligible" : "ineligible"}`}
                        >
                          {isEligible
                            ? "ELIGIBLE"
                            : `${result.failureReasons.length} ISSUE${
                                result.failureReasons.length === 1 ? "" : "S"
                              }`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          <section>
            <h2>Available Career Fair Roles</h2>
            {roles.map((role) => (
              <div className="role-ref" key={role.id}>
                <h3>
                  <span className="role-id">{role.id}</span>
                  {role.title}
                </h3>
                <p>
                  <strong>Allowed Branches:</strong> {role.allowedBranches.join(", ")}
                </p>
                <p>
                  <strong>Minimum CGPA:</strong> {role.minimumCgpa}
                </p>
                <p>
                  <strong>Graduation Years:</strong>{" "}
                  {role.allowedGraduationYears.join(", ")}
                </p>
                <p>
                  <strong>Maximum Active Backlogs:</strong> {role.maximumActiveBacklogs}
                </p>
                <p>
                  <strong>Required Skills:</strong> {role.requiredSkills.join(", ")}
                </p>
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}

export default App;