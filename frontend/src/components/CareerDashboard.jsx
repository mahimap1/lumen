import React, { useState, useEffect } from "react";
import CandidateProfileGrapher from "./CandidateProfileGrapher";

const TARGET_ROLES = [
  {
    title: "Software Engineer",
    skills: ["Data Structures", "Algorithms", "Python", "C++", "Testing", "Git", "Problem Solving"],
    medianSalary: 82000
  },
  {
    title: "Data Scientist / ML Engineer",
    skills: ["Python", "Machine Learning", "Data Analysis", "SQL", "Statistics", "Linear Algebra", "Algorithms"],
    medianSalary: 86500
  },
  {
    title: "Cybersecurity Analyst",
    skills: ["Network Security", "Cryptography", "Risk Assessment", "Operating Systems", "Linux", "Ethical Hacking"],
    medianSalary: 84000
  },
  {
    title: "Cloud & DevOps Architect",
    skills: ["Cloud Architecture", "Distributed Systems", "Linux", "Docker", "CI/CD", "Networks"],
    medianSalary: 89000
  },
  {
    title: "Systems / Business Analyst",
    skills: ["SQL", "Data Modeling", "Business Process", "Requirements", "Project Management", "Technical Writing"],
    medianSalary: 76500
  }
];

export default function CareerDashboard() {
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "simulator" | "twins" | "skills"
  
  // Data states
  const [dashboardData, setDashboardData] = useState(null);
  const [pathwayData, setPathwayData] = useState(null);
  const [catalogCourses, setCatalogCourses] = useState([]);
  const [twins, setTwins] = useState([]);
  
  // Simulator states
  const [simMajor, setSimMajor] = useState("Computer Science");
  const [simTrack, setSimTrack] = useState("Artificial Intelligence");
  const [simResidency, setSimResidency] = useState("In-State");
  const [simInternships, setSimInternships] = useState(1);
  const [simClearance, setSimClearance] = useState(false);
  const [simLoanAmount, setSimLoanAmount] = useState(20000);

  // Skill Gap states
  const [selectedRole, setSelectedRole] = useState(TARGET_ROLES[0]);
  const [completedCourses, setCompletedCourses] = useState(["CMSC201", "CMSC202", "CMSC341", "MATH221"]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:8000/api/career/dashboard").then((r) => r.json()),
      fetch("http://localhost:8000/api/career/pathways").then((r) => r.json()),
      fetch("http://localhost:8000/api/career/course-catalog-skills").then((r) => r.json()),
    ])
      .then(([dash, path, catalog]) => {
        setDashboardData(dash);
        setPathwayData(path);
        if (catalog.courses) setCatalogCourses(catalog.courses);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Career API Error:", err);
        setLoading(false);
      });
  }, []);

  // Fetch twins when major/track/internships change
  useEffect(() => {
    fetch(`http://localhost:8000/api/career/alumni-twins?major=${encodeURIComponent(simMajor)}&track=${encodeURIComponent(simTrack)}&min_internships=${simInternships}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.twins) setTwins(res.twins);
      })
      .catch((err) => console.error("Twins fetch error:", err));
  }, [simMajor, simTrack, simInternships]);

  if (loading || !dashboardData) {
    return (
      <div style={{ padding: "50px 20px", textAlign: "center", color: "var(--text-secondary)" }}>
        <div style={{ fontSize: "28px", marginBottom: "12px" }}>🚀</div>
        <p style={{ fontSize: "15px" }}>Loading Career Intelligence & Alumni Benchmarks...</p>
      </div>
    );
  }

  const { summary, majors, internship_impact, top_employers, top_roles } = dashboardData;
  const seniorityLadder = pathwayData?.seniority_ladder || [];
  const trackStats = pathwayData?.track_stats || [];

  // ROI Calculator Calculations
  const baseSalary = simMajor === "Computer Science" ? 80800 : 76100;
  const internshipBonus = simInternships === 0 ? 0 : simInternships === 1 ? 9500 : 16000;
  const clearanceBonus = simClearance ? 7500 : 0;
  const estimatedStartingSalary = baseSalary + internshipBonus + clearanceBonus;
  
  const estimatedNetCost = simResidency === "In-State" ? 34000 : 68000;
  const annualDiscretionary = Math.max(1, estimatedStartingSalary * 0.35); // ~35% toward savings/loans
  const paybackYears = (simLoanAmount / annualDiscretionary).toFixed(1);
  const fiveYearNetReturn = Math.round((estimatedStartingSalary * 5 * 1.08) - estimatedNetCost);

  // Skill Gap Calculations
  const userAcquiredSkills = new Set();
  completedCourses.forEach((cId) => {
    const c = catalogCourses.find((x) => x.course_id === cId);
    if (c && c.skill_tags) {
      c.skill_tags.split("|").forEach((s) => userAcquiredSkills.add(s.trim()));
    }
  });

  const missingSkills = selectedRole.skills.filter((s) => !userAcquiredSkills.has(s));
  const matchPercentage = Math.round(((selectedRole.skills.length - missingSkills.length) / selectedRole.skills.length) * 100);

  // Recommended courses for missing skills
  const recommendedCourses = catalogCourses.filter((c) => {
    if (completedCourses.includes(c.course_id)) return false;
    if (!c.skill_tags) return false;
    const courseSkills = c.skill_tags.split("|").map((s) => s.trim());
    return courseSkills.some((s) => missingSkills.includes(s));
  }).slice(0, 4);

  return (
    <div className="career-container" style={{ padding: "10px 0 50px 0" }}>
      {/* Header Banner */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <span style={{ fontSize: "28px" }}>🧭</span>
              <h1 style={{ margin: 0, fontSize: "24px", fontWeight: 700, color: "var(--text-main)" }}>
                Career Pathways & Degree ROI
              </h1>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  padding: "3px 8px",
                  borderRadius: "12px",
                  background: "rgba(59, 130, 246, 0.15)",
                  color: "#3b82f6",
                  border: "1px solid rgba(59, 130, 246, 0.3)"
                }}
              >
                DoIT Track
              </span>
            </div>
            <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "13.5px" }}>
              Data-driven advising engine backed by <strong>3,200 UMBC alumni trajectories</strong> & <strong>138,000 course attempts</strong>.
            </p>
          </div>

          {/* Tab Navigation Pill */}
          <div
            style={{
              display: "flex",
              background: "var(--bg-active)",
              padding: "4px",
              borderRadius: "8px",
              border: "1px solid var(--border-color)",
              gap: "4px",
              flexWrap: "wrap"
            }}
          >
            {[
              { id: "overview", label: "📊 Overview", title: "Dataset Metrics" },
              { id: "grapher", label: "🧬 Candidate Pathway Graph", title: "Prerequisite & Milestone Tree" },
              { id: "simulator", label: "🧮 ROI Simulator", title: "Calculate Degree Return" },
              { id: "skills", label: "🎯 Skill-Gap Matcher", title: "Course-to-Career Alignment" },
              { id: "twins", label: "👥 Alumni Twins", title: "Lookalike Graduate Outcomes" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "6px 12px",
                  fontSize: "12.5px",
                  fontWeight: activeTab === tab.id ? 600 : 500,
                  color: activeTab === tab.id ? "var(--text-main)" : "var(--text-secondary)",
                  background: activeTab === tab.id ? "var(--bg-secondary)" : "transparent",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  boxShadow: activeTab === tab.id ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                  transition: "all 0.15s ease"
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* -------------------- TAB 1: OVERVIEW & BENCHMARKS -------------------- */}
      {activeTab === "overview" && (
        <div>
          {/* Top Metric Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
              gap: "14px",
              marginBottom: "24px"
            }}
          >
            <div className="notion-card" style={{ padding: "16px", borderRadius: "10px", border: "1px solid var(--border-color)", background: "var(--bg-secondary)" }}>
              <div style={{ fontSize: "11.5px", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Alumni Analyzed</div>
              <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-main)", marginTop: "4px" }}>
                {summary.total_alumni.toLocaleString()}
              </div>
              <div style={{ fontSize: "12px", color: "#10b981", marginTop: "4px" }}>
                + {summary.total_students.toLocaleString()} Active Fall 2026
              </div>
            </div>

            <div className="notion-card" style={{ padding: "16px", borderRadius: "10px", border: "1px solid var(--border-color)", background: "var(--bg-secondary)" }}>
              <div style={{ fontSize: "11.5px", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Avg Starting Salary</div>
              <div style={{ fontSize: "24px", fontWeight: 700, color: "#10b981", marginTop: "4px" }}>
                ${Math.round(summary.avg_first_salary).toLocaleString()}
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>First destination job offer</div>
            </div>

            <div className="notion-card" style={{ padding: "16px", borderRadius: "10px", border: "1px solid var(--border-color)", background: "var(--bg-secondary)" }}>
              <div style={{ fontSize: "11.5px", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Cleared Defense Salary</div>
              <div style={{ fontSize: "24px", fontWeight: 700, color: "#8b5cf6", marginTop: "4px" }}>
                ${Math.round(summary.avg_clearance_salary).toLocaleString()}
              </div>
              <div style={{ fontSize: "12px", color: "#8b5cf6", marginTop: "4px" }}>
                +${Math.round(summary.avg_clearance_salary - summary.avg_first_salary).toLocaleString()} MD defense corridor premium
              </div>
            </div>

            <div className="notion-card" style={{ padding: "16px", borderRadius: "10px", border: "1px solid var(--border-color)", background: "var(--bg-secondary)" }}>
              <div style={{ fontSize: "11.5px", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Career Growth Spells</div>
              <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-main)", marginTop: "4px" }}>
                {summary.total_records.toLocaleString()}
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>Promotions & tenure records</div>
            </div>
          </div>

          {/* Visual Career Ladder / Seniority Progression */}
          <div style={{ padding: "20px", borderRadius: "10px", border: "1px solid var(--border-color)", background: "var(--bg-secondary)", marginBottom: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: "var(--text-main)" }}>
                📈 UMBC Alumni Career Trajectory & Seniority Milestones
              </h3>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Based on 6,028 career spells</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px" }}>
              {seniorityLadder.map((step, idx) => (
                <div
                  key={step.seniority_level}
                  style={{
                    padding: "14px",
                    borderRadius: "8px",
                    background: "var(--bg-active)",
                    border: "1px solid var(--border-color)",
                    position: "relative"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#3b82f6" }}>STEP {idx + 1}</span>
                    <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>~{step.avg_tenure_months} mo</span>
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-main)", marginBottom: "4px" }}>
                    {step.seniority_level} Level
                  </div>
                  <div style={{ fontSize: "18px", fontWeight: 700, color: "#10b981" }}>
                    ${Math.round(step.avg_salary).toLocaleString()}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "4px" }}>
                    {step.total_spells.toLocaleString()} verified alumni
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Grid: Degree Track ROI & Top Employers */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px", marginBottom: "24px" }}>
            {/* Degree Tracks */}
            <div style={{ padding: "18px", borderRadius: "10px", border: "1px solid var(--border-color)", background: "var(--bg-secondary)" }}>
              <h3 style={{ margin: "0 0 14px 0", fontSize: "15px", fontWeight: 600, color: "var(--text-main)" }}>
                🎓 Average Starting Salary by Track
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {trackStats.slice(0, 6).map((t) => (
                  <div
                    key={`${t.major}-${t.track}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 12px",
                      borderRadius: "6px",
                      background: "var(--bg-active)",
                      fontSize: "13px"
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: "var(--text-main)" }}>{t.track}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{t.major} · Avg GPA: {t.avg_gpa}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontWeight: 700, color: "#10b981" }}>${Math.round(t.avg_starting_salary).toLocaleString()}</span>
                      <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{t.alumni_count} grads</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Real World Engagement Multiplier */}
            <div style={{ padding: "18px", borderRadius: "10px", border: "1px solid var(--border-color)", background: "var(--bg-secondary)" }}>
              <h3 style={{ margin: "0 0 14px 0", fontSize: "15px", fontWeight: 600, color: "var(--text-main)" }}>
                ⚡ Internship Leverage on First Destination
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {internship_impact.map((tier) => (
                  <div
                    key={tier.intern_tier}
                    style={{
                      padding: "12px 14px",
                      borderRadius: "8px",
                      background: "var(--bg-active)",
                      border: "1px solid var(--border-color)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between"
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: "var(--text-main)", fontSize: "13px" }}>
                        {tier.intern_tier}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px" }}>
                        {tier.alumni_count} alumni · {tier.avg_months_to_job} mo to land offer
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 700, color: "#10b981", fontSize: "15px" }}>
                        ${Math.round(tier.avg_starting_salary).toLocaleString()}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                        starting base
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- TAB 2: ROI SIMULATOR -------------------- */}
      {activeTab === "simulator" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "20px" }}>
          {/* Controls */}
          <div style={{ padding: "22px", borderRadius: "10px", border: "1px solid var(--border-color)", background: "var(--bg-secondary)" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: 600, color: "var(--text-main)" }}>
              🎛️ Personal Degree ROI Simulator
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "20px" }}>
              Simulate expected payback periods, net investment break-even, and salary projections based on your exact profile.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {/* Major Selection */}
              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                  PROGRAM & TRACK
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <select
                    value={simMajor}
                    onChange={(e) => setSimMajor(e.target.value)}
                    style={{ padding: "8px 10px", borderRadius: "6px", background: "var(--bg-active)", color: "var(--text-main)", border: "1px solid var(--border-color)" }}
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Systems">Information Systems</option>
                  </select>
                  <select
                    value={simTrack}
                    onChange={(e) => setSimTrack(e.target.value)}
                    style={{ padding: "8px 10px", borderRadius: "6px", background: "var(--bg-active)", color: "var(--text-main)", border: "1px solid var(--border-color)" }}
                  >
                    {simMajor === "Computer Science" ? (
                      <>
                        <option value="Artificial Intelligence">Artificial Intelligence</option>
                        <option value="Cybersecurity">Cybersecurity</option>
                        <option value="Data Science">Data Science</option>
                        <option value="Software Engineering">Software Engineering</option>
                        <option value="General">General Track</option>
                      </>
                    ) : (
                      <>
                        <option value="Business Analytics">Business Analytics</option>
                        <option value="Cybersecurity Management">Cybersecurity Management</option>
                        <option value="Software Development">Software Development</option>
                        <option value="Health Information Technology">Health IT</option>
                        <option value="General">General Track</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Residency & Loans */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                    RESIDENCY STATUS
                  </label>
                  <div style={{ display: "flex", gap: "6px" }}>
                    {["In-State", "Out-of-State"].map((res) => (
                      <button
                        key={res}
                        type="button"
                        onClick={() => setSimResidency(res)}
                        style={{
                          flex: 1,
                          padding: "8px 6px",
                          fontSize: "12px",
                          borderRadius: "6px",
                          border: "1px solid var(--border-color)",
                          background: simResidency === res ? "#3b82f6" : "var(--bg-active)",
                          color: simResidency === res ? "#fff" : "var(--text-main)",
                          cursor: "pointer"
                        }}
                      >
                        {res}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                    STUDENT LOAN PRINCIPAL (${simLoanAmount.toLocaleString()})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="60000"
                    step="2500"
                    value={simLoanAmount}
                    onChange={(e) => setSimLoanAmount(Number(e.target.value))}
                    style={{ width: "100%", marginTop: "6px" }}
                  />
                </div>
              </div>

              {/* Engagement Sliders */}
              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                  INTERNSHIP EXPERIENCE COUNT ({simInternships} Completed)
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  {[0, 1, 2, 3].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setSimInternships(num)}
                      style={{
                        flex: 1,
                        padding: "8px 0",
                        borderRadius: "6px",
                        border: "1px solid var(--border-color)",
                        background: simInternships === num ? "#10b981" : "var(--bg-active)",
                        color: simInternships === num ? "#fff" : "var(--text-main)",
                        fontWeight: 600,
                        cursor: "pointer"
                      }}
                    >
                      {num === 3 ? "3+ Internships" : `${num} Internship${num === 1 ? "" : "s"}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Security Clearance Toggle */}
              <div
                onClick={() => setSimClearance(!simClearance)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  background: simClearance ? "rgba(139, 92, 246, 0.15)" : "var(--bg-active)",
                  border: `1px solid ${simClearance ? "rgba(139, 92, 246, 0.4)" : "var(--border-color)"}`,
                  cursor: "pointer"
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: "var(--text-main)", fontSize: "13px" }}>
                    🛡️ Maryland Defense / Security Clearance Route
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px" }}>
                    Eligible for cleared contractors (DoD / NSA / APL corridor)
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={simClearance}
                  onChange={() => {}}
                  style={{ width: "16px", height: "16px", cursor: "pointer" }}
                />
              </div>
            </div>
          </div>

          {/* ROI Projection Display */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ padding: "22px", borderRadius: "10px", border: "1px solid var(--border-color)", background: "var(--bg-secondary)" }}>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Projected Starting Compensation
              </div>
              <div style={{ fontSize: "34px", fontWeight: 800, color: "#10b981", margin: "8px 0" }}>
                ${estimatedStartingSalary.toLocaleString()}
                <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-secondary)", marginLeft: "8px" }}>/ year</span>
              </div>
              <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
                Includes <strong>+${internshipBonus.toLocaleString()}</strong> from {simInternships} internship(s) and{" "}
                <strong>+${clearanceBonus.toLocaleString()}</strong> clearance premium.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div style={{ padding: "16px", borderRadius: "10px", border: "1px solid var(--border-color)", background: "var(--bg-secondary)" }}>
                <div style={{ fontSize: "11.5px", color: "var(--text-secondary)" }}>Debt Payback Window</div>
                <div style={{ fontSize: "22px", fontWeight: 700, color: "#3b82f6", marginTop: "4px" }}>
                  {simLoanAmount === 0 ? "0.0 Years" : `${paybackYears} Years`}
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "4px" }}>
                  Based on 35% net savings allocation
                </div>
              </div>

              <div style={{ padding: "16px", borderRadius: "10px", border: "1px solid var(--border-color)", background: "var(--bg-secondary)" }}>
                <div style={{ fontSize: "11.5px", color: "var(--text-secondary)" }}>5-Year Net ROI</div>
                <div style={{ fontSize: "22px", fontWeight: 700, color: "#10b981", marginTop: "4px" }}>
                  +${fiveYearNetReturn.toLocaleString()}
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "4px" }}>
                  Net earnings minus degree tuition
                </div>
              </div>
            </div>

            <div style={{ padding: "16px", borderRadius: "10px", border: "1px solid rgba(59, 130, 246, 0.3)", background: "rgba(59, 130, 246, 0.08)" }}>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "#3b82f6", marginBottom: "4px" }}>
                💡 Career Coach Recommendation
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-main)", margin: 0, lineHeight: 1.5 }}>
                {simInternships === 0
                  ? "Adding just 1 internship during junior year accelerates job placement by 2.7 months and boosts starting salary by ~$10k. Prioritize CMSC 341 and apply for summer co-ops."
                  : simClearance
                  ? "Combining 2+ internships with a security clearance places you in the top 8% of starting salaries in the Baltimore-DC defense corridor."
                  : "Great foundation! You are on track for sub-1 year loan amortization with strong starting placement."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- TAB 3: SKILL GAP & COURSE RECOMMENDER -------------------- */}
      {activeTab === "skills" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          {/* Target Role Selector & Required Skills */}
          <div style={{ padding: "20px", borderRadius: "10px", border: "1px solid var(--border-color)", background: "var(--bg-secondary)" }}>
            <h3 style={{ margin: "0 0 14px 0", fontSize: "15px", fontWeight: 600, color: "var(--text-main)" }}>
              🎯 Select Target Career Pathway
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "18px" }}>
              {TARGET_ROLES.map((r) => (
                <div
                  key={r.title}
                  onClick={() => setSelectedRole(r)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: selectedRole.title === r.title ? "rgba(59, 130, 246, 0.15)" : "var(--bg-active)",
                    border: `1px solid ${selectedRole.title === r.title ? "#3b82f6" : "var(--border-color)"}`
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: "13px", color: "var(--text-main)" }}>{r.title}</span>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "#10b981" }}>${r.medianSalary.toLocaleString()} median</span>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>
                  MARKET SKILL COVERAGE MATCH
                </span>
                <span style={{ fontSize: "13px", fontWeight: 700, color: matchPercentage > 60 ? "#10b981" : "#f59e0b" }}>
                  {matchPercentage}% Ready
                </span>
              </div>
              <div style={{ height: "8px", background: "var(--bg-active)", borderRadius: "4px", overflow: "hidden" }}>
                <div
                  style={{
                    width: `${matchPercentage}%`,
                    height: "100%",
                    background: matchPercentage > 60 ? "#10b981" : "#f59e0b",
                    transition: "width 0.3s ease"
                  }}
                />
              </div>
            </div>

            <div>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px" }}>
                CORE COMPETENCIES REQUIRED FOR {selectedRole.title.toUpperCase()}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {selectedRole.skills.map((s) => {
                  const hasSkill = userAcquiredSkills.has(s);
                  return (
                    <span
                      key={s}
                      style={{
                        fontSize: "11.5px",
                        padding: "4px 8px",
                        borderRadius: "6px",
                        fontWeight: 500,
                        background: hasSkill ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                        color: hasSkill ? "#10b981" : "#ef4444",
                        border: `1px solid ${hasSkill ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`
                      }}
                    >
                      {hasSkill ? "✓ " : "✗ "} {s}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recommended Electives to Close Gap */}
          <div style={{ padding: "20px", borderRadius: "10px", border: "1px solid var(--border-color)", background: "var(--bg-secondary)" }}>
            <h3 style={{ margin: "0 0 10px 0", fontSize: "15px", fontWeight: 600, color: "var(--text-main)" }}>
              📚 Recommended UMBC Courses to Close Skill Gap
            </h3>
            <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", marginBottom: "16px" }}>
              Electives in the catalog that cover your missing competencies ({missingSkills.join(", ") || "None!"}).
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {recommendedCourses.map((c) => (
                <div
                  key={c.course_id}
                  style={{
                    padding: "12px 14px",
                    borderRadius: "8px",
                    background: "var(--bg-active)",
                    border: "1px solid var(--border-color)"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <span style={{ fontWeight: 700, color: "var(--text-main)", fontSize: "13px" }}>
                      {c.course_id}: {c.course_title}
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{c.credits} Credits</span>
                  </div>
                  <div style={{ fontSize: "11px", color: "#3b82f6", marginBottom: "6px" }}>
                    Skills: {c.skill_tags}
                  </div>
                  <button
                    onClick={() => setCompletedCourses([...completedCourses, c.course_id])}
                    style={{
                      padding: "4px 8px",
                      fontSize: "11px",
                      borderRadius: "4px",
                      border: "none",
                      background: "#3b82f6",
                      color: "#fff",
                      cursor: "pointer",
                      fontWeight: 600
                    }}
                  >
                    + Add to My Plan (Acquire Skills)
                  </button>
                </div>
              ))}
              {recommendedCourses.length === 0 && (
                <div style={{ padding: "20px", textAlign: "center", color: "#10b981", fontSize: "13px" }}>
                  🎉 All required skills for this role are covered in your completed curriculum!
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* -------------------- TAB: CANDIDATE PATHWAY GRAPHER -------------------- */}
      {activeTab === "grapher" && (
        <CandidateProfileGrapher />
      )}

      {/* -------------------- TAB 4: ALUMNI TWINS -------------------- */}
      {activeTab === "twins" && (
        <div>
          <div style={{ marginBottom: "18px" }}>
            <h3 style={{ margin: "0 0 6px 0", fontSize: "16px", fontWeight: 600, color: "var(--text-main)" }}>
              👥 Real Alumni Lookalikes ({simMajor} · {simTrack})
            </h3>
            <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)" }}>
              Actual graduate outcomes with {simInternships}+ internships who graduated in this track.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px" }}>
            {twins.map((twin) => (
              <div
                key={twin.campus_id}
                style={{
                  padding: "16px",
                  borderRadius: "10px",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-color)",
                  position: "relative"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <div>
                    <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)" }}>{twin.campus_id}</span>
                    <h4 style={{ margin: "2px 0 0 0", fontSize: "14.5px", fontWeight: 600, color: "var(--text-main)" }}>
                      {twin.job_title}
                    </h4>
                  </div>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "#10b981" }}>
                    ${Number(twin.annual_salary_usd).toLocaleString()}
                  </span>
                </div>

                <div style={{ fontSize: "12.5px", color: "var(--text-secondary)", marginBottom: "10px" }}>
                  🏢 {twin.employer} {twin.is_remote === "TRUE" ? "(Remote)" : ""}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", fontSize: "11.5px", background: "var(--bg-active)", padding: "8px 10px", borderRadius: "6px" }}>
                  <div>Final GPA: <strong>{twin.final_gpa}</strong></div>
                  <div>Internships: <strong>{twin.internship_count}</strong></div>
                  <div>First Job in: <strong>{twin.months_to_first_job} mo</strong></div>
                  <div>Clearance: <strong>{twin.requires_clearance === "TRUE" ? "Yes 🛡️" : "No"}</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
