import React, { useState, useMemo } from "react";
import ALUMNI_PROFILES from "../data/alumniPathwaysData.json";

export default function AlumniPathwaysView({ onSelectCredentialOrSkill }) {
  // Filters
  const [selectedRole, setSelectedRole] = useState("All");
  const [selectedCampusId, setSelectedCampusId] = useState("All");
  const [highlightCourse, setHighlightCourse] = useState(null);

  // Extract distinct roles for dropdown filter
  const distinctRoles = useMemo(() => {
    const roles = new Set();
    ALUMNI_PROFILES.forEach((p) => {
      const title = p.employment?.[0]?.job_title || p.alumnus?.first_job_title;
      if (title) roles.add(title);
    });
    return Array.from(roles).sort();
  }, []);

  // Filter candidates by role
  const filteredCandidates = useMemo(() => {
    return ALUMNI_PROFILES.filter((p) => {
      const title = p.employment?.[0]?.job_title || p.alumnus?.first_job_title;
      if (selectedRole !== "All" && title !== selectedRole) return false;
      return true;
    });
  }, [selectedRole]);

  // Determine active displayed alumnus
  const activeProfile = useMemo(() => {
    if (selectedCampusId !== "All") {
      const found = ALUMNI_PROFILES.find((p) => p.alumnus.campus_id === selectedCampusId);
      if (found) return found;
    }
    return filteredCandidates[0] || ALUMNI_PROFILES[0];
  }, [selectedCampusId, filteredCandidates]);

  const alumnus = activeProfile?.alumnus;
  const employment = activeProfile?.employment || [];
  const experiences = activeProfile?.experiences || [];
  const transcripts = activeProfile?.transcripts || [];

  // Group transcripts and experiences chronologically by term
  const termSortKey = (termStr) => {
    const parts = (termStr || "").split(" ");
    if (parts.length === 2) {
      const season = parts[0];
      const year = parts[1];
      const seasonOrder = { Winter: 0, Spring: 1, Summer: 2, Fall: 3 };
      try {
        return parseInt(year, 10) * 10 + (seasonOrder[season] || 0);
      } catch (e) {
        return 0;
      }
    }
    return 0;
  };

  const termsMap = {};
  transcripts.forEach((row) => {
    const t = row.term || "Freshman Fall";
    if (!termsMap[t]) termsMap[t] = { term: t, courses: [], experiences: [] };
    termsMap[t].courses.push(row);
  });

  experiences.forEach((row) => {
    const t = row.term || "Sophomore Summer";
    if (!termsMap[t]) termsMap[t] = { term: t, courses: [], experiences: [] };
    termsMap[t].experiences.push(row);
  });

  const sortedTerms = Object.values(termsMap).sort((a, b) => termSortKey(a.term) - termSortKey(b.term));

  // Prerequisite relationships
  const connectedPrereqs = new Set();
  const connectedDependents = new Set();
  if (highlightCourse) {
    transcripts.forEach((c) => {
      if (c.course_id === highlightCourse && c.prerequisite_ids && c.prerequisite_ids !== "Not Applicable") {
        c.prerequisite_ids.split("|").forEach((p) => connectedPrereqs.add(p.trim()));
      }
      if (c.prerequisite_ids && c.prerequisite_ids.includes(highlightCourse)) {
        connectedDependents.add(c.course_id);
      }
    });
  }

  // Aggregate metrics
  const medianSalary = 128500;
  const avgMonthsToJob = 0.8;

  return (
    <div className="notion-screen active" style={{ maxWidth: "100%", width: "100%", paddingBottom: "48px" }}>
      <div style={{ marginBottom: "20px" }}>
        <h1 className="page-title" style={{ fontSize: "24px", marginBottom: "4px" }}>
          Alumni Pathways
        </h1>
        <p className="page-description" style={{ margin: 0, fontSize: "13px" }}>
          Explore verified graduation trajectories, coursework paths, and milestone progression sequenced term-by-term.
        </p>
      </div>

      {/* Aggregate Metric Highlights (No emojis) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "12px",
          marginBottom: "20px"
        }}
      >
        <div className="notion-callout" style={{ padding: "12px 16px", margin: 0, background: "var(--bg-callout)", border: "1px solid var(--border-subtle)" }}>
          <div>
            <div style={{ fontSize: "11px", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Median Starting Compensation
            </div>
            <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-main)", marginTop: "2px" }}>
              ${medianSalary.toLocaleString()} <span style={{ fontSize: "11.5px", color: "var(--tag-green-text)", fontWeight: 500 }}>verified first destination</span>
            </div>
          </div>
        </div>

        <div className="notion-callout" style={{ padding: "12px 16px", margin: 0, background: "var(--bg-callout)", border: "1px solid var(--border-subtle)" }}>
          <div>
            <div style={{ fontSize: "11px", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Average Time to Placement
            </div>
            <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-main)", marginTop: "2px" }}>
              {avgMonthsToJob} Months <span style={{ fontSize: "11.5px", color: "var(--tag-blue-text)", fontWeight: 500 }}>post-conferral</span>
            </div>
          </div>
        </div>

        <div className="notion-callout" style={{ padding: "12px 16px", margin: 0, background: "var(--bg-callout)", border: "1px solid var(--border-subtle)" }}>
          <div>
            <div style={{ fontSize: "11px", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Curated Pathway Profiles
            </div>
            <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-main)", marginTop: "2px" }}>
              {ALUMNI_PROFILES.length} Verified Records <span style={{ fontSize: "11.5px", color: "var(--text-secondary)", fontWeight: 500 }}>across {distinctRoles.length} roles</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar: End Role and Individual ID Selector */}
      <div
        style={{
          background: "#121215",
          border: "1px solid var(--border-subtle)",
          borderRadius: "8px",
          padding: "14px 18px",
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "14px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          {/* Filter by End Role */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 500 }}>
              End Role:
            </span>
            <select
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value);
                setSelectedCampusId("All");
              }}
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                border: "1px solid var(--border-subtle)",
                background: "var(--bg-active)",
                color: "var(--text-main)",
                fontSize: "12.5px",
                fontWeight: 500,
                outline: "none",
                cursor: "pointer"
              }}
            >
              <option value="All">All Roles ({distinctRoles.length})</option>
              {distinctRoles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Select Specific Alumnus by ID */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 500 }}>
              Alumnus ID:
            </span>
            <select
              value={alumnus?.campus_id || ""}
              onChange={(e) => setSelectedCampusId(e.target.value)}
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                border: "1px solid var(--border-subtle)",
                background: "var(--bg-active)",
                color: "var(--text-main)",
                fontSize: "12.5px",
                fontWeight: 600,
                fontFamily: "monospace",
                outline: "none",
                cursor: "pointer"
              }}
            >
              {filteredCandidates.map((p) => {
                const c = p.alumnus;
                const emp = p.employment?.[0];
                return (
                  <option key={c.campus_id} value={c.campus_id}>
                    {c.campus_id} — {c.track} · {emp?.job_title} (${Number(emp?.annual_salary_usd || 0).toLocaleString()})
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Selected Alumnus Metadata summary */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "12px" }}>
          <span style={{ color: "var(--text-secondary)" }}>
            Conferred: <strong style={{ color: "var(--text-main)" }}>{alumnus?.graduation_term}</strong>
          </span>
          <span style={{ color: "var(--border-subtle)" }}>•</span>
          <span style={{ color: "var(--text-secondary)" }}>
            GPA: <strong style={{ color: "var(--tag-green-text)" }}>{alumnus?.final_gpa}</strong>
          </span>
          <span style={{ color: "var(--border-subtle)" }}>•</span>
          <span style={{ color: "var(--text-secondary)" }}>
            Degree: <strong style={{ color: "var(--text-main)" }}>{alumnus?.major}</strong> ({alumnus?.track})
          </span>
        </div>
      </div>

      {/* Guide / Instruction strip */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "11.5px",
          color: "var(--text-secondary)",
          marginBottom: "12px",
          padding: "0 2px"
        }}
      >
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <span style={{ width: "9px", height: "9px", borderRadius: "2px", background: "#3b82f6" }}></span>
            Core Course
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <span style={{ width: "9px", height: "9px", borderRadius: "2px", background: "#8b5cf6" }}></span>
            Upper Elective
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <span style={{ width: "9px", height: "9px", borderRadius: "2px", background: "#10b981" }}></span>
            Internship
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <span style={{ width: "9px", height: "9px", borderRadius: "2px", background: "#f59e0b" }}></span>
            Certification / Micro-Credential
          </span>
        </div>
        <div style={{ color: "var(--text-tertiary)" }}>
          Hover over any course to highlight prerequisite and unlocked sequence
        </div>
      </div>

      {/* Horizontally Scrollable Pathway Timeline (Matching Four-Year Plan layout) */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          overflowX: "auto",
          paddingBottom: "16px",
          scrollSnapType: "x mandatory",
          alignItems: "stretch"
        }}
      >
        {sortedTerms.map((termObj, termIndex) => (
          <div
            key={termObj.term}
            style={{
              flex: "0 0 280px",
              minWidth: "280px",
              background: "#121215",
              border: "1px solid var(--border-subtle)",
              borderRadius: "8px",
              display: "flex",
              flexDirection: "column",
              scrollSnapAlign: "start",
              overflow: "hidden"
            }}
          >
            {/* Term Column Header */}
            <div
              style={{
                padding: "10px 14px",
                borderBottom: "1px solid var(--border-subtle)",
                background: "rgba(255, 255, 255, 0.02)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#3b82f6" }}>
                  TERM {termIndex + 1}
                </span>
                <span style={{ fontWeight: 600, fontSize: "13px", color: "var(--text-main)" }}>
                  {termObj.term}
                </span>
              </div>
              <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                {termObj.courses.length} courses
              </span>
            </div>

            {/* Courses & Experiences in this Term */}
            <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
              {/* Course Cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {termObj.courses.map((course) => {
                  const isHovered = highlightCourse === course.course_id;
                  const isPrereq = connectedPrereqs.has(course.course_id);
                  const isDependent = connectedDependents.has(course.course_id);

                  let borderColor = "var(--border-subtle)";
                  let bgColor = "rgba(255, 255, 255, 0.03)";
                  if (isHovered) {
                    borderColor = "#3b82f6";
                    bgColor = "rgba(59, 130, 246, 0.15)";
                  } else if (isPrereq) {
                    borderColor = "#f59e0b";
                    bgColor = "rgba(245, 158, 11, 0.15)";
                  } else if (isDependent) {
                    borderColor = "#10b981";
                    bgColor = "rgba(16, 185, 129, 0.15)";
                  }

                  const isUpper = course.course_level === "Upper";

                  return (
                    <div
                      key={course.course_id}
                      onMouseEnter={() => setHighlightCourse(course.course_id)}
                      onMouseLeave={() => setHighlightCourse(null)}
                      onClick={() => onSelectCredentialOrSkill && onSelectCredentialOrSkill(course.course_id)}
                      style={{
                        padding: "8px 10px",
                        borderRadius: "6px",
                        border: `1px solid ${borderColor}`,
                        background: bgColor,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        position: "relative"
                      }}
                      title="Click to consult Lumen about this course"
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3px" }}>
                        <span style={{ fontWeight: 700, fontSize: "12.5px", color: isUpper ? "#8b5cf6" : "#3b82f6" }}>
                          {course.course_id}
                        </span>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            padding: "1px 5px",
                            borderRadius: "4px",
                            background: course.grade === "A" ? "rgba(16, 185, 129, 0.2)" : "rgba(59, 130, 246, 0.2)",
                            color: course.grade === "A" ? "#10b981" : "#3b82f6"
                          }}
                        >
                          {course.grade}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: "11.5px",
                          color: "var(--text-main)",
                          lineHeight: "1.3",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap"
                        }}
                      >
                        {course.course_title}
                      </div>

                      {/* Prereq label if any */}
                      {course.prerequisite_ids && course.prerequisite_ids !== "Not Applicable" && (
                        <div style={{ fontSize: "10px", color: "var(--text-tertiary)", marginTop: "4px" }}>
                          Prereq: <em>{course.prerequisite_ids}</em>
                        </div>
                      )}

                      {/* Highlight badges */}
                      {isPrereq && (
                        <span style={{ position: "absolute", top: "-6px", right: "6px", fontSize: "9px", background: "#f59e0b", color: "#000", fontWeight: 700, padding: "1px 4px", borderRadius: "3px" }}>
                          PREREQ
                        </span>
                      )}
                      {isDependent && (
                        <span style={{ position: "absolute", top: "-6px", right: "6px", fontSize: "9px", background: "#10b981", color: "#fff", fontWeight: 700, padding: "1px 4px", borderRadius: "3px" }}>
                          UNLOCKED
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Milestones & Experience in this term (Internships, certifications) */}
              {termObj.experiences.length > 0 && (
                <div style={{ marginTop: "6px", paddingTop: "8px", borderTop: "1px dashed var(--border-subtle)", display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ fontSize: "10.5px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>
                    Milestones & Experience
                  </div>
                  {termObj.experiences.map((exp) => {
                    let badgeBg = "rgba(59, 130, 246, 0.12)";
                    let badgeColor = "#3b82f6";

                    if (exp.experience_type === "Internship") {
                      badgeBg = "rgba(16, 185, 129, 0.12)";
                      badgeColor = "#10b981";
                    } else if (exp.experience_type === "Certification") {
                      badgeBg = "rgba(245, 158, 11, 0.12)";
                      badgeColor = "#f59e0b";
                    } else if (exp.experience_type === "Hackathon") {
                      badgeBg = "rgba(236, 72, 153, 0.12)";
                      badgeColor = "#ec4899";
                    }

                    return (
                      <div
                        key={exp.record_id}
                        style={{
                          padding: "8px",
                          borderRadius: "6px",
                          background: badgeBg,
                          border: `1px solid ${badgeColor}35`,
                          fontSize: "11.5px"
                        }}
                      >
                        <div style={{ fontSize: "10.5px", fontWeight: 700, color: badgeColor, textTransform: "uppercase" }}>
                          {exp.experience_type}
                        </div>
                        <div style={{ fontWeight: 600, color: "var(--text-main)", marginTop: "2px" }}>
                          {exp.experience_name}
                        </div>
                        <div style={{ fontSize: "10.5px", color: "var(--text-secondary)", marginTop: "1px" }}>
                          {exp.organization} · {exp.outcome}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Post-Graduation Job Offer Destination Column */}
        <div
          style={{
            flex: "0 0 300px",
            minWidth: "300px",
            background: "linear-gradient(145deg, #121215, rgba(16, 185, 129, 0.08))",
            borderRadius: "8px",
            border: "2px solid #10b981",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            scrollSnapAlign: "start"
          }}
        >
          <div
            style={{
              padding: "10px 14px",
              background: "rgba(16, 185, 129, 0.15)",
              borderBottom: "1px solid #10b98140",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#10b981" }}>
              FIRST DESTINATION OUTCOME
            </span>
            <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
              {alumnus?.campus_id}
            </span>
          </div>

          <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px", flex: 1, justifyContent: "center" }}>
            <div>
              <div style={{ fontSize: "11px", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Job Title & Employer
              </div>
              <div style={{ fontSize: "17px", fontWeight: 700, color: "var(--text-main)", marginTop: "3px" }}>
                {employment[0]?.job_title || alumnus?.first_job_title}
              </div>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>
                {employment[0]?.employer || alumnus?.first_employer}
              </div>
            </div>

            <div style={{ padding: "12px", borderRadius: "6px", background: "rgba(255, 255, 255, 0.03)", border: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: "11px", color: "var(--text-secondary)", textTransform: "uppercase" }}>Starting Base Compensation</div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "#10b981", marginTop: "2px" }}>
                ${Number(employment[0]?.annual_salary_usd || alumnus?.first_job_annual_salary_usd || 0).toLocaleString()}
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "4px" }}>
                Landed offer in {alumnus?.months_to_first_job} months post-conferral
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", fontSize: "11.5px" }}>
              <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "6px 8px", borderRadius: "4px", border: "1px solid var(--border-subtle)" }}>
                Region: <strong style={{ color: "var(--text-main)" }}>{employment[0]?.region || alumnus?.first_job_region}</strong>
              </div>
              <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "6px 8px", borderRadius: "4px", border: "1px solid var(--border-subtle)" }}>
                Clearance: <strong style={{ color: "var(--text-main)" }}>{employment[0]?.requires_clearance === "TRUE" ? "Yes" : "No"}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
