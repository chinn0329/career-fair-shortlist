// src/data.js

export const defaultStudent = {
  branch: "CSE",
  cgpa: 8.1,
  graduationYear: 2027,
  activeBacklogs: 1,
  skills: "Git, Python, SQL"
};

export const roles = [
  {
    id: "CF01",
    title: "Data Operations Intern",
    allowedBranches: ["CSE", "IT"],
    minimumCgpa: 7.5,
    allowedGraduationYears: [2027],
    maximumActiveBacklogs: 1,
    requiredSkills: ["Python", "SQL"]
  },

  {
    id: "CF02",
    title: "QA Automation Intern",
    allowedBranches: ["CSE", "ECE", "IT"],
    minimumCgpa: 7.0,
    allowedGraduationYears: [2027, 2028],
    maximumActiveBacklogs: 1,
    requiredSkills: ["Git"]
  },

  {
    id: "CF03",
    title: "Embedded Systems Intern",
    allowedBranches: ["ECE", "EEE"],
    minimumCgpa: 7.5,
    allowedGraduationYears: [2027],
    maximumActiveBacklogs: 1,
    requiredSkills: ["Git"]
  },

  {
    id: "CF04",
    title: "Machine Learning Intern",
    allowedBranches: ["CSE", "IT"],
    minimumCgpa: 8.5,
    allowedGraduationYears: [2027],
    maximumActiveBacklogs: 1,
    requiredSkills: ["Python"]
  },

  {
    id: "CF05",
    title: "Platform Engineering Intern",
    allowedBranches: ["CSE", "ECE"],
    minimumCgpa: 7.0,
    allowedGraduationYears: [2026],
    maximumActiveBacklogs: 0,
    requiredSkills: ["Docker", "Git"]
  }
];
