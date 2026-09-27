import React, { useState } from "react";

const INITIAL_DEGREE_PLAN = [
  {
    id: "fall-2025",
    term: "Fall 2025",
    yearLabel: "Freshman",
    status: "Completed",
    courses: [
      { id: "c1", code: "CMSC 201", name: "Computer Science I", credits: 4 },
      { id: "c2", code: "MATH 151", name: "Calculus and Analytic Geometry I", credits: 4 },
      { id: "c3", code: "ENGL 100", name: "Composition", credits: 3 },
      { id: "c4", code: "GEP AH", name: "Arts & Humanities Foundation", credits: 3 },
      { id: "c5", code: "FYS 101", name: "First Year Seminar", credits: 1 }
    ],
    skills: [
      { id: "s1", name: "Git & GitHub Essentials", tag: "Tools", completed: true },
      { id: "s2", name: "Linux CLI & Bash", tag: "Systems", completed: true }
    ]
  },
  {
    id: "spring-2026",
    term: "Spring 2026",
    yearLabel: "Freshman",
    status: "Completed",
    courses: [
      { id: "c6", code: "CMSC 202", name: "Computer Science II (C++)", credits: 4 },
      { id: "c7", code: "CMSC 203", name: "Discrete Structures", credits: 4 },
      { id: "c8", code: "MATH 152", name: "Calculus and Analytic Geometry II", credits: 4 },
      { id: "c9", code: "GEP SS", name: "Social Sciences Foundation", credits: 3 }
    ],
    skills: [
      { id: "s3", name: "AWS Cloud Practitioner (CCP)", tag: "Cloud", completed: true },
      { id: "s4", name: "C++ Memory Management", tag: "Language", completed: true }
    ]
  },
  {
    id: "fall-2026",
    term: "Fall 2026",
    yearLabel: "Sophomore",
    status: "Planned",
    courses: [
      { id: "c10", code: "CMSC 341", name: "Data Structures", credits: 3 },
      { id: "c11", code: "CMSC 313", name: "Computer Organization & Assembly", credits: 3 },
      { id: "c12", code: "MATH 221", name: "Linear Algebra", credits: 3 },
      { id: "c13", code: "PHYS 121", name: "Introductory Physics I", credits: 4 },
      { id: "c14", code: "ECON 101", name: "Principles of Macroeconomics", credits: 3 }
    ],
    skills: [
      { id: "s5", name: "AWS Solutions Architect", tag: "Cloud", completed: false },
      { id: "s6", name: "Docker Containerization", tag: "DevOps", completed: false }
    ]
  },
  {
    id: "spring-2027",
    term: "Spring 2027",
    yearLabel: "Sophomore",
    status: "Planned",
    courses: [
      { id: "c15", code: "CMSC 421", name: "Operating Systems", credits: 3 },
      { id: "c16", code: "CMSC 441", name: "Design & Analysis of Algorithms", credits: 3 },
      { id: "c17", code: "ECON 102", name: "Principles of Microeconomics", credits: 3 },
      { id: "c18", code: "SCI 101", name: "Intro to Physical Sciences", credits: 4 }
    ],
    skills: [
      { id: "s7", name: "Kubernetes & Microservices", tag: "Cloud", completed: false }
    ]
  },
  {
    id: "fall-2027",
    term: "Fall 2027",
    yearLabel: "Junior",
    status: "Planned",
    courses: [
      { id: "c19", code: "CMSC 471", name: "Intro to Artificial Intelligence", credits: 3 },
      { id: "c20", code: "CMSC 447", name: "Software Engineering Project", credits: 3 },
      { id: "c21", code: "STAT 355", name: "Applied Statistics for Engineers", credits: 4 },
      { id: "c22", code: "GEP Culture", name: "Global Culture Elective", credits: 3 }
    ],
    skills: [
      { id: "s8", name: "PyTorch & Deep Learning", tag: "AI/ML", completed: false },
      { id: "s9", name: "Terraform IaC", tag: "DevOps", completed: false }
    ]
  },
  {
    id: "spring-2028",
    term: "Spring 2028",
    yearLabel: "Junior",
    status: "Planned",
    courses: [
      { id: "c23", code: "CMSC 481", name: "Computer Networks", credits: 3 },
      { id: "c24", code: "CMSC 435", name: "Computer Graphics", credits: 3 },
      { id: "c25", code: "CMSC Upper", name: "Upper Level CS Technical Track", credits: 3 },
      { id: "c26", code: "Free Elective", name: "Open Degree Elective", credits: 3 }
    ],
    skills: [
      { id: "s10", name: "Distributed Systems & gRPC", tag: "Systems", completed: false }
    ]
  },
  {
    id: "fall-2028",
    term: "Fall 2028",
    yearLabel: "Senior",
    status: "Planned",
    courses: [
      { id: "c27", code: "CMSC 491", name: "Seminar: Distributed Systems", credits: 3 },
      { id: "c28", code: "CMSC Upper", name: "CS Technical Elective", credits: 3 },
      { id: "c29", code: "GEP Writing", name: "Writing Intensive Upper Elective", credits: 3 },
      { id: "c30", code: "Free Elective", name: "Tech Entrepreneurship", credits: 3 }
    ],
    skills: [
      { id: "s11", name: "System Design & Architecture", tag: "Career", completed: false }
    ]
  },
  {
    id: "spring-2029",
    term: "Spring 2029",
    yearLabel: "Senior",
    status: "Planned",
    courses: [
      { id: "c31", code: "CMSC 499", name: "Senior Design Capstone", credits: 4 },
      { id: "c32", code: "CMSC Upper", name: "Cloud Architecture Systems", credits: 3 },
      { id: "c33", code: "Free Elective", name: "General Elective", credits: 3 }
    ],
    skills: [
      { id: "s12", name: "Full-Stack Deployment & CI/CD", tag: "DevOps", completed: false }
    ]
  }
];

const TOTAL_GRADUATION_CREDITS = 120;
const TOTAL_CAREER_SKILLS_TARGET = 12;

export default function FourYearPlanView() {
  const [semesters, setSemesters] = useState(() => {
    try {
      const saved = localStorage.getItem("lumen_four_year_plan_v3");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return INITIAL_DEGREE_PLAN;
  });

  const [activeModal, setActiveModal] = useState(null); // { type: 'course'|'skill', semesterId: string, semesterTerm: string }
  const [courseForm, setCourseForm] = useState({ code: "", name: "", credits: "3" });
  const [skillForm, setSkillForm] = useState({ name: "", tag: "Cloud" });

  const saveSemesters = (updated) => {
    setSemesters(updated);
    try {
      localStorage.setItem("lumen_four_year_plan_v3", JSON.stringify(updated));
    } catch (e) {}
  };

  // Calculations for Progress Box
  let completedCredits = 0;
  let completedSkillsCount = 0;
  let totalSkillsTracked = 0;

  semesters.forEach((sem) => {
    const isCompleted = sem.status === "Completed";
    sem.courses.forEach((c) => {
      const cr = Number(c.credits) || 0;
      if (isCompleted) completedCredits += cr;
    });
    (sem.skills || []).forEach((s) => {
      totalSkillsTracked += 1;
      if (s.completed || isCompleted) completedSkillsCount += 1;
    });
  });

  const gradPct = Math.min(100, Math.round((completedCredits / TOTAL_GRADUATION_CREDITS) * 100));
  const careerPct = Math.min(
    100,
    Math.round((completedSkillsCount / Math.max(TOTAL_CAREER_SKILLS_TARGET, totalSkillsTracked)) * 100)
  );

  const handleOpenAddCourse = (semId, term) => {
    setCourseForm({ code: "", name: "", credits: "3" });
    setActiveModal({ type: "course", semesterId: semId, semesterTerm: term });
  };

  const handleOpenAddSkill = (semId, term) => {
    setSkillForm({ name: "", tag: "Cloud" });
    setActiveModal({ type: "skill", semesterId: semId, semesterTerm: term });
  };

  const handleCloseModal = () => {
    setActiveModal(null);
  };

  const handleAddCourseSubmit = (e) => {
    e.preventDefault();
    if (!courseForm.code.trim() || !courseForm.name.trim()) return;

    const updated = semesters.map((sem) => {
      if (sem.id === activeModal.semesterId) {
        return {
          ...sem,
          courses: [
            ...sem.courses,
            {
              id: `c_${Date.now()}`,
              code: courseForm.code.trim().toUpperCase(),
              name: courseForm.name.trim(),
              credits: parseInt(courseForm.credits, 10) || 3
            }
          ]
        };
      }
      return sem;
    });

    saveSemesters(updated);
    handleCloseModal();
  };

  const handleAddSkillSubmit = (e) => {
    e.preventDefault();
    if (!skillForm.name.trim()) return;

    const updated = semesters.map((sem) => {
      if (sem.id === activeModal.semesterId) {
        return {
          ...sem,
          skills: [
            ...(sem.skills || []),
            {
              id: `s_${Date.now()}`,
              name: skillForm.name.trim(),
              tag: skillForm.tag || "Skill",
              completed: sem.status === "Completed"
            }
          ]
        };
      }
      return sem;
    });

    saveSemesters(updated);
    handleCloseModal();
  };

  const handleDeleteCourse = (semId, courseId) => {
    const updated = semesters.map((sem) => {
      if (sem.id === semId) {
        return {
          ...sem,
          courses: sem.courses.filter((c) => c.id !== courseId)
        };
      }
      return sem;
    });
    saveSemesters(updated);
  };

  const handleDeleteSkill = (semId, skillId) => {
    const updated = semesters.map((sem) => {
      if (sem.id === semId) {
        return {
          ...sem,
          skills: (sem.skills || []).filter((s) => s.id !== skillId)
        };
      }
      return sem;
    });
    saveSemesters(updated);
  };

  return (
    <div style={{ width: "100%", paddingBottom: "24px", display: "flex", flexDirection: "column" }}>
      {/* Page Header - Locked, no subtitle */}
      <div style={{ marginBottom: "18px" }}>
        <h1
          style={{
            fontSize: "24px",
            fontWeight: 600,
            color: "var(--text-main)",
            margin: 0,
            letterSpacing: "-0.015em"
          }}
        >
          Four Year Plan
        </h1>
      </div>

      {/* Box of Two Progress Bars: Graduation Progress & Career Readiness - Locked */}
      <div
        style={{
          background: "#121215",
          border: "1px solid var(--border-subtle)",
          borderRadius: "8px",
          padding: "16px 20px",
          marginBottom: "24px",
          width: "100%",
          boxSizing: "border-box"
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "28px",
            alignItems: "center"
          }}
        >
          {/* Graduation Progress */}
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: "6px"
              }}
            >
              <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-main)" }}>
                Graduation Progress
              </span>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                <strong style={{ color: "var(--text-main)", fontWeight: 600 }}>{completedCredits}</strong> / {TOTAL_GRADUATION_CREDITS} credits ({gradPct}%)
              </span>
            </div>
            <div
              style={{
                width: "100%",
                height: "6px",
                background: "rgba(255, 255, 255, 0.08)",
                borderRadius: "3px",
                overflow: "hidden"
              }}
            >
              <div
                style={{
                  width: `${gradPct}%`,
                  height: "100%",
                  background: "#3b82f6",
                  borderRadius: "3px",
                  transition: "width 0.3s ease"
                }}
              />
            </div>
            <div style={{ marginTop: "4px", fontSize: "11px", color: "var(--text-tertiary)" }}>
              {Math.max(0, TOTAL_GRADUATION_CREDITS - completedCredits)} credits remaining for graduation
            </div>
          </div>

          {/* Career Readiness */}
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: "6px"
              }}
            >
              <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-main)" }}>
                Career Readiness
              </span>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                <strong style={{ color: "var(--text-main)", fontWeight: 600 }}>{completedSkillsCount}</strong> / {Math.max(TOTAL_CAREER_SKILLS_TARGET, totalSkillsTracked)} skills ({careerPct}%)
              </span>
            </div>
            <div
              style={{
                width: "100%",
                height: "6px",
                background: "rgba(255, 255, 255, 0.08)",
                borderRadius: "3px",
                overflow: "hidden"
              }}
            >
              <div
                style={{
                  width: `${careerPct}%`,
                  height: "100%",
                  background: "#10b981",
                  borderRadius: "3px",
                  transition: "width 0.3s ease"
                }}
              />
            </div>
            <div style={{ marginTop: "4px", fontSize: "11px", color: "var(--text-tertiary)" }}>
              {Math.max(0, Math.max(TOTAL_CAREER_SKILLS_TARGET, totalSkillsTracked) - completedSkillsCount)} target micro-credentials and skills remaining
            </div>
          </div>
        </div>
      </div>

      {/* Horizontally Scrollable Kanban Board */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          overflowX: "auto",
          paddingBottom: "16px",
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch"
        }}
      >
        {semesters.map((sem) => {
          const isCompleted = sem.status === "Completed";
          const semCredits = sem.courses.reduce((sum, c) => sum + (Number(c.credits) || 0), 0);

          return (
            <div
              key={sem.id}
              style={{
                width: "310px",
                minWidth: "310px",
                flexShrink: 0,
                scrollSnapAlign: "start",
                background: isCompleted ? "#141417" : "#0d0d10",
                border: isCompleted
                  ? "1px solid rgba(255, 255, 255, 0.12)"
                  : "1px solid rgba(255, 255, 255, 0.04)",
                borderRadius: "6px",
                opacity: isCompleted ? 1 : 0.45,
                display: "flex",
                flexDirection: "column",
                transition: "opacity 0.15s ease, border-color 0.15s ease"
              }}
              onMouseEnter={(e) => {
                if (!isCompleted) {
                  e.currentTarget.style.opacity = "0.85";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isCompleted) {
                  e.currentTarget.style.opacity = "0.45";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.04)";
                }
              }}
            >
              {/* Card Header */}
              <div
                style={{
                  padding: "12px 14px",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span
                      style={{
                        fontSize: "13.5px",
                        fontWeight: 600,
                        color: isCompleted ? "var(--text-main)" : "var(--text-secondary)"
                      }}
                    >
                      {sem.term}
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
                      {sem.yearLabel}
                    </span>
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-tertiary)", marginTop: "2px" }}>
                    {semCredits} Credits
                  </div>
                </div>

                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 500,
                    padding: "2px 6px",
                    borderRadius: "3px",
                    background: isCompleted ? "rgba(46, 170, 118, 0.15)" : "rgba(255, 255, 255, 0.05)",
                    color: isCompleted ? "#4dab9a" : "var(--text-tertiary)"
                  }}
                >
                  {isCompleted ? "Completed" : "Planned"}
                </span>
              </div>

              {/* Card Body */}
              <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "16px", flex: 1 }}>
                {/* Courses Section */}
                <div>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "var(--text-tertiary)",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      marginBottom: "8px"
                    }}
                  >
                    Courses ({sem.courses.length})
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    {sem.courses.map((course) => (
                      <div
                        key={course.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "6px 8px",
                          borderRadius: "4px",
                          background: isCompleted ? "rgba(255, 255, 255, 0.03)" : "rgba(255, 255, 255, 0.015)",
                          border: "1px solid rgba(255, 255, 255, 0.05)"
                        }}
                      >
                        <div style={{ minWidth: 0, flex: 1, marginRight: "6px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span
                              style={{
                                fontFamily: "monospace",
                                fontSize: "11px",
                                fontWeight: 600,
                                color: isCompleted ? "#93c5fd" : "var(--text-secondary)"
                              }}
                            >
                              {course.code}
                            </span>
                            <span style={{ fontSize: "10.5px", color: "var(--text-tertiary)" }}>
                              {course.credits}cr
                            </span>
                          </div>
                          <div
                            style={{
                              fontSize: "11.5px",
                              color: isCompleted ? "var(--text-main)" : "var(--text-secondary)",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis"
                            }}
                            title={course.name}
                          >
                            {course.name}
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteCourse(sem.id, course.id)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "var(--text-tertiary)",
                            cursor: "pointer",
                            fontSize: "11px",
                            padding: "2px 4px",
                            opacity: 0.6
                          }}
                          title="Remove course"
                          onMouseEnter={(e) => (e.target.style.opacity = 1)}
                          onMouseLeave={(e) => (e.target.style.opacity = 0.6)}
                        >
                          ×
                        </button>
                      </div>
                    ))}

                    <button
                      onClick={() => handleOpenAddCourse(sem.id, sem.term)}
                      className="notion-btn"
                      style={{
                        width: "100%",
                        justifyContent: "center",
                        padding: "5px 8px",
                        fontSize: "11px",
                        color: "var(--text-secondary)",
                        border: "1px dashed rgba(255, 255, 255, 0.12)",
                        marginTop: "2px",
                        borderRadius: "4px"
                      }}
                    >
                      + Add Course
                    </button>
                  </div>
                </div>

                {/* Skills Section */}
                <div>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "var(--text-tertiary)",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      marginBottom: "8px"
                    }}
                  >
                    Skills & Micro-credentials ({(sem.skills || []).length})
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    {(sem.skills || []).map((skill) => (
                      <div
                        key={skill.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "6px 8px",
                          borderRadius: "4px",
                          background: isCompleted ? "rgba(46, 170, 118, 0.04)" : "rgba(255, 255, 255, 0.015)",
                          border: "1px solid rgba(255, 255, 255, 0.05)"
                        }}
                      >
                        <div style={{ minWidth: 0, flex: 1, marginRight: "6px" }}>
                          <span
                            style={{
                              fontSize: "10px",
                              padding: "1px 5px",
                              borderRadius: "3px",
                              background: "rgba(255, 255, 255, 0.06)",
                              color: "var(--text-secondary)",
                              display: "inline-block",
                              marginBottom: "2px"
                            }}
                          >
                            {skill.tag}
                          </span>
                          <div
                            style={{
                              fontSize: "11.5px",
                              color: isCompleted ? "var(--text-main)" : "var(--text-secondary)",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis"
                            }}
                            title={skill.name}
                          >
                            {skill.name}
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteSkill(sem.id, skill.id)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "var(--text-tertiary)",
                            cursor: "pointer",
                            fontSize: "11px",
                            padding: "2px 4px",
                            opacity: 0.6
                          }}
                          title="Remove skill"
                          onMouseEnter={(e) => (e.target.style.opacity = 1)}
                          onMouseLeave={(e) => (e.target.style.opacity = 0.6)}
                        >
                          ×
                        </button>
                      </div>
                    ))}

                    <button
                      onClick={() => handleOpenAddSkill(sem.id, sem.term)}
                      className="notion-btn"
                      style={{
                        width: "100%",
                        justifyContent: "center",
                        padding: "5px 8px",
                        fontSize: "11px",
                        color: "var(--text-secondary)",
                        border: "1px dashed rgba(255, 255, 255, 0.12)",
                        marginTop: "2px",
                        borderRadius: "4px"
                      }}
                    >
                      + Add Skill
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Course Modal */}
      {activeModal && activeModal.type === "course" && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(2px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          }}
          onClick={handleCloseModal}
        >
          <div
            style={{
              background: "#18181b",
              border: "1px solid var(--border-subtle)",
              borderRadius: "6px",
              padding: "18px 20px",
              width: "100%",
              maxWidth: "380px"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "var(--text-main)" }}>
                  Add Course
                </h3>
                <span style={{ fontSize: "11.5px", color: "var(--text-tertiary)" }}>
                  {activeModal.semesterTerm}
                </span>
              </div>
              <button
                onClick={handleCloseModal}
                style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: "16px" }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddCourseSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11.5px", color: "var(--text-secondary)", marginBottom: "4px" }}>
                  Course Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CMSC 481"
                  value={courseForm.code}
                  onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "7px 9px",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "4px",
                    color: "#fff",
                    fontSize: "12.5px",
                    outline: "none"
                  }}
                  autoFocus
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11.5px", color: "var(--text-secondary)", marginBottom: "4px" }}>
                  Course Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Computer Networks"
                  value={courseForm.name}
                  onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "7px 9px",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "4px",
                    color: "#fff",
                    fontSize: "12.5px",
                    outline: "none"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11.5px", color: "var(--text-secondary)", marginBottom: "4px" }}>
                  Credits
                </label>
                <input
                  type="number"
                  min="1"
                  max="6"
                  value={courseForm.credits}
                  onChange={(e) => setCourseForm({ ...courseForm, credits: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "7px 9px",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "4px",
                    color: "#fff",
                    fontSize: "12.5px",
                    outline: "none"
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="notion-btn"
                  style={{ padding: "5px 12px", fontSize: "12px" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="notion-btn primary"
                  style={{ padding: "5px 14px", fontSize: "12px" }}
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Skill Modal */}
      {activeModal && activeModal.type === "skill" && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(2px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          }}
          onClick={handleCloseModal}
        >
          <div
            style={{
              background: "#18181b",
              border: "1px solid var(--border-subtle)",
              borderRadius: "6px",
              padding: "18px 20px",
              width: "100%",
              maxWidth: "380px"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "var(--text-main)" }}>
                  Add Skill / Micro-credential
                </h3>
                <span style={{ fontSize: "11.5px", color: "var(--text-tertiary)" }}>
                  {activeModal.semesterTerm}
                </span>
              </div>
              <button
                onClick={handleCloseModal}
                style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: "16px" }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddSkillSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11.5px", color: "var(--text-secondary)", marginBottom: "4px" }}>
                  Skill or Micro-credential Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AWS Solutions Architect, Docker"
                  value={skillForm.name}
                  onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "7px 9px",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "4px",
                    color: "#fff",
                    fontSize: "12.5px",
                    outline: "none"
                  }}
                  autoFocus
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11.5px", color: "var(--text-secondary)", marginBottom: "4px" }}>
                  Tag
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cloud, Systems, DevOps, Language"
                  value={skillForm.tag}
                  onChange={(e) => setSkillForm({ ...skillForm, tag: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "7px 9px",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "4px",
                    color: "#fff",
                    fontSize: "12.5px",
                    outline: "none"
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="notion-btn"
                  style={{ padding: "5px 12px", fontSize: "12px" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="notion-btn primary"
                  style={{ padding: "5px 14px", fontSize: "12px" }}
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
