import React, { useState, useEffect } from "react";

export default function CandidateProfileGrapher() {
  const [candidates, setCandidates] = useState([]);
  const [selectedCid, setSelectedCid] = useState("CID-185594");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [highlightCourse, setHighlightCourse] = useState(null);

  // Fetch candidate list on mount
  useEffect(() => {
    fetch("http://localhost:8000/api/career/candidate-list")
      .then((r) => r.json())
      .then((res) => {
        if (res.candidates && res.candidates.length > 0) {
          setCandidates(res.candidates);
        }
      })
      .catch((err) => console.error("Error loading candidate list:", err));
  }, []);

  // Fetch candidate profile when selectedCid changes
  useEffect(() => {
    if (!selectedCid) return;
    setLoading(true);
    fetch(`http://localhost:8000/api/career/candidate-profile/${selectedCid}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.status === "success") {
          setProfile(res);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading candidate profile:", err);
        setLoading(false);
      });
  }, [selectedCid]);

  if (!candidates.length && loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary)" }}>
        <p>Loading candidate grapher...</p>
      </div>
    );
  }

  const alumnus = profile?.alumnus;
  const timeline = profile?.timeline || [];
  const employment = profile?.employment || [];
  const prereqEdges = profile?.prereq_edges || [];

  // Compute connected prerequisites or post-requisites when hovering over a course
  const connectedPrereqs = new Set();
  const connectedDependents = new Set();
  if (highlightCourse) {
    prereqEdges.forEach((edge) => {
      if (edge.to === highlightCourse) connectedPrereqs.add(edge.from);
      if (edge.from === highlightCourse) connectedDependents.add(edge.to);
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Candidate Selector & Header Bar */}
      <div
        style={{
          padding: "18px 20px",
          borderRadius: "10px",
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-color)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "14px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "16px"
            }}
          >
            🎓
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontWeight: 700, fontSize: "16px", color: "var(--text-main)" }}>
                {alumnus?.campus_id} · {alumnus?.major} ({alumnus?.track})
              </span>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: "10px",
                  background: "rgba(16, 185, 129, 0.15)",
                  color: "#10b981"
                }}
              >
                GPA: {alumnus?.final_gpa}
              </span>
            </div>
            <div style={{ fontSize: "12.5px", color: "var(--text-secondary)", marginTop: "3px" }}>
              Conferred: {alumnus?.graduation_term} · Time to Degree: {alumnus?.time_to_degree_years} yrs · First Job: <strong>{employment[0]?.job_title}</strong> at <strong>{employment[0]?.employer}</strong> (${Number(employment[0]?.annual_salary_usd || 0).toLocaleString()})
            </div>
          </div>
        </div>

        {/* Candidate Dropdown */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 500 }}>Select Alumnus:</span>
          <select
            value={selectedCid}
            onChange={(e) => setSelectedCid(e.target.value)}
            style={{
              padding: "7px 12px",
              borderRadius: "6px",
              border: "1px solid var(--border-color)",
              background: "var(--bg-active)",
              color: "var(--text-main)",
              fontSize: "12.5px",
              fontWeight: 500
            }}
          >
            {candidates.map((c) => (
              <option key={c.campus_id} value={c.campus_id}>
                {c.campus_id} — {c.major} ({c.track}) · ${Number(c.annual_salary_usd).toLocaleString()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Legend & Instructions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", color: "var(--text-secondary)", flexWrap: "wrap", gap: "10px" }}>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "#3b82f6" }}></span>
            Core Course
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "#8b5cf6" }}></span>
            Upper Elective
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "#10b981" }}></span>
            Internship
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "#f59e0b" }}></span>
            Micro-Credential / Cert
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "#ec4899" }}></span>
            Hackathon / Research
          </span>
        </div>
        <div>
          💡 <em>Hover over any course to highlight prerequisite chain!</em>
        </div>
      </div>

      {/* Chronological Left-to-Right Horizontal Graph Tree */}
      <div
        style={{
          overflowX: "auto",
          paddingBottom: "16px",
          display: "flex",
          gap: "18px",
          alignItems: "stretch"
        }}
      >
        {timeline.map((termObj, termIndex) => (
          <div
            key={termObj.term}
            style={{
              minWidth: "260px",
              maxWidth: "280px",
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              background: "var(--bg-secondary)",
              borderRadius: "10px",
              border: "1px solid var(--border-color)",
              overflow: "hidden"
            }}
          >
            {/* Term Header */}
            <div
              style={{
                padding: "10px 14px",
                background: "var(--bg-active)",
                borderBottom: "1px solid var(--border-color)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#3b82f6" }}>TERM {termIndex + 1}</span>
                <span style={{ fontWeight: 600, fontSize: "13px", color: "var(--text-main)" }}>{termObj.term}</span>
              </div>
              <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                {termObj.courses.length} courses
              </span>
            </div>

            {/* Courses and Experiences in this Term */}
            <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
              {/* Courses */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {termObj.courses.map((course) => {
                  const isHovered = highlightCourse === course.course_id;
                  const isPrereq = connectedPrereqs.has(course.course_id);
                  const isDependent = connectedDependents.has(course.course_id);

                  let borderColor = "var(--border-color)";
                  let bgColor = "var(--bg-active)";
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
                      style={{
                        padding: "8px 10px",
                        borderRadius: "6px",
                        border: `1px solid ${borderColor}`,
                        background: bgColor,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        position: "relative"
                      }}
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
                        title={course.course_title}
                      >
                        {course.course_title}
                      </div>

                      {/* Prerequisites tag if exists */}
                      {course.prerequisite_ids && course.prerequisite_ids !== "Not Applicable" && (
                        <div style={{ fontSize: "10px", color: "var(--text-secondary)", marginTop: "4px" }}>
                          Prereq: <em>{course.prerequisite_ids}</em>
                        </div>
                      )}

                      {/* Highlight Badges */}
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

              {/* Experiences & Micro-Credentials in this Term */}
              {termObj.experiences.length > 0 && (
                <div style={{ marginTop: "6px", paddingTop: "8px", borderTop: "1px dashed var(--border-color)", display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ fontSize: "10.5px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>
                    Milestones & Experience
                  </div>
                  {termObj.experiences.map((exp) => {
                    let badgeBg = "rgba(59, 130, 246, 0.15)";
                    let badgeColor = "#3b82f6";
                    let icon = "⚡";

                    if (exp.experience_type === "Internship") {
                      badgeBg = "rgba(16, 185, 129, 0.15)";
                      badgeColor = "#10b981";
                      icon = "💼";
                    } else if (exp.experience_type === "Certification") {
                      badgeBg = "rgba(245, 158, 11, 0.15)";
                      badgeColor = "#f59e0b";
                      icon = "📜";
                    } else if (exp.experience_type === "Hackathon") {
                      badgeBg = "rgba(236, 72, 153, 0.15)";
                      badgeColor = "#ec4899";
                      icon = "🏆";
                    }

                    return (
                      <div
                        key={exp.record_id}
                        style={{
                          padding: "8px",
                          borderRadius: "6px",
                          background: badgeBg,
                          border: `1px solid ${badgeColor}40`,
                          fontSize: "11.5px"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "5px", fontWeight: 600, color: badgeColor }}>
                          <span>{icon}</span>
                          <span>{exp.experience_type}</span>
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

        {/* Post-Graduation Job Outcome Card (The Far Right Destination Node) */}
        <div
          style={{
            minWidth: "280px",
            maxWidth: "300px",
            flexShrink: 0,
            background: "linear-gradient(145deg, var(--bg-secondary), rgba(16, 185, 129, 0.08))",
            borderRadius: "10px",
            border: "2px solid #10b981",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden"
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
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#10b981" }}>🎯 POST-GRAD DESTINATION</span>
            <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Outcome</span>
          </div>

          <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px", flex: 1, justifyContent: "center" }}>
            <div>
              <div style={{ fontSize: "11.5px", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                First Destination Job Offer
              </div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-main)", marginTop: "2px" }}>
                {employment[0]?.job_title}
              </div>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>
                🏢 {employment[0]?.employer}
              </div>
            </div>

            <div style={{ padding: "12px", borderRadius: "8px", background: "var(--bg-active)", border: "1px solid var(--border-color)" }}>
              <div style={{ fontSize: "11.5px", color: "var(--text-secondary)" }}>Starting Base Compensation</div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "#10b981", marginTop: "2px" }}>
                ${Number(employment[0]?.annual_salary_usd || 0).toLocaleString()}
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "4px" }}>
                Landed offer in {alumnus?.months_to_first_job} months post-conferral
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", fontSize: "11.5px" }}>
              <div style={{ background: "var(--bg-active)", padding: "6px 8px", borderRadius: "4px" }}>
                Location: <strong>{employment[0]?.region}</strong>
              </div>
              <div style={{ background: "var(--bg-active)", padding: "6px 8px", borderRadius: "4px" }}>
                Cleared: <strong>{employment[0]?.requires_clearance === "TRUE" ? "Yes 🛡️" : "No"}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
