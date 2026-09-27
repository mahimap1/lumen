import React from "react";

const DEGREE_PLAN = [
  {
    year: "Freshman Year",
    semesters: [
      {
        term: "Fall 2024",
        status: "Completed",
        credits: 15,
        courses: [
          { code: "CMSC 201", name: "Computer Science I", credits: 4, grade: "A", status: "completed" },
          { code: "MATH 151", name: "Calculus and Analytic Geometry I", credits: 4, grade: "A", status: "completed" },
          { code: "ENGL 100", name: "Composition", credits: 3, grade: "A", status: "completed" },
          { code: "GEP AH", name: "Arts & Humanities Foundation", credits: 3, grade: "B+", status: "completed" },
          { code: "FYS 101", name: "First Year Seminar", credits: 1, grade: "P", status: "completed" }
        ]
      },
      {
        term: "Spring 2025",
        status: "Completed",
        credits: 15,
        courses: [
          { code: "CMSC 202", name: "Computer Science II (C++)", credits: 4, grade: "A", status: "completed" },
          { code: "CMSC 203", name: "Discrete Structures", credits: 4, grade: "A-", status: "completed" },
          { code: "MATH 152", name: "Calculus and Analytic Geometry II", credits: 4, grade: "B+", status: "completed" },
          { code: "GEP SS", name: "Social Sciences Foundation", credits: 3, grade: "A", status: "completed" }
        ]
      }
    ]
  },
  {
    year: "Sophomore Year",
    semesters: [
      {
        term: "Fall 2025",
        status: "Completed",
        credits: 16,
        courses: [
          { code: "CMSC 341", name: "Data Structures", credits: 3, grade: "A", status: "completed" },
          { code: "CMSC 313", name: "Computer Organization & Assembly", credits: 3, grade: "A", status: "completed" },
          { code: "MATH 221", name: "Linear Algebra", credits: 3, grade: "A", status: "completed" },
          { code: "PHYS 121", name: "Introductory Physics I", credits: 4, grade: "B+", status: "completed" },
          { code: "ECON 101", name: "Principles of Macroeconomics", credits: 3, grade: "A", status: "completed" }
        ]
      },
      {
        term: "Spring 2026",
        status: "In Progress",
        credits: 16,
        courses: [
          { code: "CMSC 421", name: "Operating Systems", credits: 3, grade: "In Progress", status: "in-progress" },
          { code: "CMSC 441", name: "Design & Analysis of Algorithms", credits: 3, grade: "In Progress", status: "in-progress" },
          { code: "ECON 102", name: "Principles of Microeconomics", credits: 3, grade: "In Progress", status: "in-progress" },
          { code: "SCI 101", name: "Intro to Physical Sciences", credits: 4, grade: "In Progress", status: "in-progress" },
          { code: "AWS CCP", name: "AWS Cloud Practitioner Credential", credits: 3, grade: "Enrolled", status: "credential" }
        ]
      }
    ]
  },
  {
    year: "Junior Year",
    semesters: [
      {
        term: "Fall 2026 (Planned)",
        status: "Planned",
        credits: 15,
        courses: [
          { code: "CMSC 471", name: "Intro to Artificial Intelligence", credits: 3, grade: "Planned", status: "planned" },
          { code: "CMSC 447", name: "Software Engineering Project", credits: 3, grade: "Planned", status: "planned" },
          { code: "STAT 355", name: "Applied Statistics for Engineers", credits: 4, grade: "Planned", status: "planned" },
          { code: "GEP Culture", name: "Global Culture Elective", credits: 3, grade: "Planned", status: "planned" }
        ]
      },
      {
        term: "Spring 2027 (Planned)",
        status: "Planned",
        credits: 15,
        courses: [
          { code: "CMSC 481", name: "Computer Networks", credits: 3, grade: "Planned", status: "planned" },
          { code: "CMSC 435", name: "Computer Graphics", credits: 3, grade: "Planned", status: "planned" },
          { code: "Upper Elective", name: "Upper Level CS Technical Track", credits: 3, grade: "Planned", status: "planned" },
          { code: "General Elective", name: "Open Degree Elective", credits: 3, grade: "Planned", status: "planned" }
        ]
      }
    ]
  },
  {
    year: "Senior Year",
    semesters: [
      {
        term: "Fall 2027 (Planned)",
        status: "Planned",
        credits: 15,
        courses: [
          { code: "CMSC 491", name: "Advanced Seminar: Distributed Systems", credits: 3, grade: "Planned", status: "planned" },
          { code: "CMSC Upper", name: "Computer Science Technical Elective", credits: 3, grade: "Planned", status: "planned" },
          { code: "GEP Writing", name: "Writing Intensive Upper Elective", credits: 3, grade: "Planned", status: "planned" },
          { code: "Free Elective", name: "Venture & Tech Entrepreneurship", credits: 3, grade: "Planned", status: "planned" }
        ]
      },
      {
        term: "Spring 2028 (Planned)",
        status: "Planned",
        credits: 13,
        courses: [
          { code: "CMSC 499", name: "Senior Design Capstone", credits: 4, grade: "Planned", status: "planned" },
          { code: "CMSC Upper", name: "Cloud Architecture Systems", credits: 3, grade: "Planned", status: "planned" },
          { code: "Free Elective", name: "General Elective", credits: 3, grade: "Planned", status: "planned" }
        ]
      }
    ]
  }
];

export default function FourYearPlanView({ onStartSessionFromCourse }) {
  return (
    <div className="notion-screen active">
      <div className="page-icon-wrapper">📋</div>
      <h1 className="page-title">Four Year Plan</h1>
      <p className="page-description">
        Academic degree roadmap, course milestones, and prerequisite sequences for B.S. in Computer Science.
      </p>

      {/* Progress Metric Badges */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "12px",
          marginBottom: "24px"
        }}
      >
        <div className="notion-callout" style={{ padding: "14px 16px", margin: 0 }}>
          <div style={{ fontSize: "20px" }}>🎯</div>
          <div>
            <div style={{ fontSize: "11px", color: "var(--text-secondary)", textTransform: "uppercase" }}>Completed Credits</div>
            <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-main)" }}>
              62 / 120 <span style={{ fontSize: "12px", color: "var(--tag-green-text)", fontWeight: 500 }}>• 51.6%</span>
            </div>
          </div>
        </div>

        <div className="notion-callout" style={{ padding: "14px 16px", margin: 0 }}>
          <div style={{ fontSize: "20px" }}>⭐</div>
          <div>
            <div style={{ fontSize: "11px", color: "var(--text-secondary)", textTransform: "uppercase" }}>Cumulative GPA</div>
            <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-main)" }}>
              3.85 <span style={{ fontSize: "12px", color: "var(--tag-blue-text)", fontWeight: 500 }}>• Dean's List</span>
            </div>
          </div>
        </div>

        <div className="notion-callout" style={{ padding: "14px 16px", margin: 0 }}>
          <div style={{ fontSize: "20px" }}>🎓</div>
          <div>
            <div style={{ fontSize: "11px", color: "var(--text-secondary)", textTransform: "uppercase" }}>Degree Specialization</div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-main)" }}>
              Systems & Cloud Computing
            </div>
          </div>
        </div>
      </div>

      {/* Degree Requirement Progress Bars */}
      <div
        style={{
          background: "var(--bg-callout)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "6px",
          padding: "16px 20px",
          marginBottom: "28px"
        }}
      >
        <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: "12px", color: "var(--text-main)" }}>
          Degree Audit Tracker
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
              <span style={{ color: "var(--text-secondary)" }}>CS Core Requirements</span>
              <span style={{ fontWeight: 600 }}>24 / 32 credits</span>
            </div>
            <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.08)", borderRadius: "3px" }}>
              <div style={{ width: "75%", height: "100%", background: "#3b82f6", borderRadius: "3px" }}></div>
            </div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
              <span style={{ color: "var(--text-secondary)" }}>Math & Science Foundation</span>
              <span style={{ fontWeight: 600 }}>19 / 23 credits</span>
            </div>
            <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.08)", borderRadius: "3px" }}>
              <div style={{ width: "82%", height: "100%", background: "#10b981", borderRadius: "3px" }}></div>
            </div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
              <span style={{ color: "var(--text-secondary)" }}>Upper-Level CS Electives</span>
              <span style={{ fontWeight: 600 }}>6 / 15 credits</span>
            </div>
            <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.08)", borderRadius: "3px" }}>
              <div style={{ width: "40%", height: "100%", background: "#a855f7", borderRadius: "3px" }}></div>
            </div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
              <span style={{ color: "var(--text-secondary)" }}>General Education Program (GEP)</span>
              <span style={{ fontWeight: 600 }}>18 / 24 credits</span>
            </div>
            <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.08)", borderRadius: "3px" }}>
              <div style={{ width: "75%", height: "100%", background: "#f59e0b", borderRadius: "3px" }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Year by Year Semesters Roadmap */}
      <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
        {DEGREE_PLAN.map((yearGroup) => (
          <div key={yearGroup.year}>
            <div
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "var(--text-main)",
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <span style={{ color: "var(--tag-blue-text)" }}>●</span>
              {yearGroup.year}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "16px" }}>
              {yearGroup.semesters.map((sem) => (
                <div
                  key={sem.term}
                  style={{
                    background: "var(--bg-sidebar)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "8px",
                    overflow: "hidden"
                  }}
                >
                  {/* Semester Header */}
                  <div
                    style={{
                      padding: "10px 14px",
                      background: "rgba(255, 255, 255, 0.02)",
                      borderBottom: "1px solid var(--border-subtle)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 600, fontSize: "13px", color: "var(--text-main)" }}>
                        {sem.term}
                      </span>
                      <span style={{ fontSize: "11.5px", color: "var(--text-tertiary)", marginLeft: "8px" }}>
                        ({sem.credits} credits)
                      </span>
                    </div>
                    <span
                      className={`notion-tag ${
                        sem.status === "Completed"
                          ? "green"
                          : sem.status === "In Progress"
                          ? "blue"
                          : "gray"
                      }`}
                      style={{ fontSize: "11px" }}
                    >
                      {sem.status}
                    </span>
                  </div>

                  {/* Course List */}
                  <div style={{ padding: "8px 10px", display: "flex", flexDirection: "column", gap: "6px" }}>
                    {sem.courses.map((course) => (
                      <div
                        key={course.code}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "6px 8px",
                          borderRadius: "4px",
                          background: "var(--bg-callout)",
                          border: "1px solid rgba(255, 255, 255, 0.04)"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                          <span
                            style={{
                              fontFamily: "monospace",
                              fontSize: "12px",
                              fontWeight: 600,
                              color: "var(--tag-blue-text)",
                              background: "rgba(59, 130, 246, 0.1)",
                              padding: "2px 6px",
                              borderRadius: "4px"
                            }}
                          >
                            {course.code}
                          </span>
                          <span
                            style={{
                              fontSize: "12.5px",
                              color: "var(--text-main)",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis"
                            }}
                            title={course.name}
                          >
                            {course.name}
                          </span>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                          <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
                            {course.credits} cr
                          </span>
                          {onStartSessionFromCourse && (
                            <button
                              onClick={() => onStartSessionFromCourse(course.code)}
                              className="notion-btn"
                              style={{
                                fontSize: "11px",
                                padding: "2px 6px",
                                border: "1px solid var(--border-subtle)"
                              }}
                              title={`Start study session for ${course.code}`}
                            >
                              ⚡ Study
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
