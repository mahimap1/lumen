import React, { useState } from "react";

const ALUMNI_DATA = [
  {
    id: "alex-chen",
    name: "Alex Chen",
    role: "Senior Cloud Solutions Architect",
    company: "Amazon Web Services (AWS)",
    gradYear: "2023",
    track: "Cloud & Infrastructure",
    salaryBand: "$165k - $190k",
    avatar: "☁️",
    keyCourses: ["CMSC 313", "CMSC 421", "CMSC 481"],
    credentials: ["AWS CCP", "AWS Solutions Architect Associate", "CKA"],
    skills: ["Distributed Systems", "Terraform", "Kubernetes", "IAM Policy", "VPC Peering"],
    story: "Mastered memory hierarchy in CMSC313 and OS paging in 421 before getting the AWS CCP credential in my junior year. It set me apart during technical rounds."
  },
  {
    id: "maya-patel",
    name: "Maya Patel",
    role: "Systems Software Engineer",
    company: "Bloomberg L.P.",
    gradYear: "2022",
    track: "Fullstack & Systems",
    salaryBand: "$175k - $210k",
    avatar: "⚡",
    keyCourses: ["CMSC 341", "CMSC 313", "MATH 221"],
    credentials: ["Linux Foundation LFCS"],
    skills: ["C++20", "Lock-free Queues", "TCP Sockets", "Data Structures", "Low Latency"],
    story: "Pointer manipulation in CMSC 341 and assembly registers in 313 were the direct basis for low-latency market data processing interview questions."
  },
  {
    id: "marcus-vance",
    name: "Marcus Vance",
    role: "Machine Learning Platform Engineer",
    company: "Capital One (Center for Machine Learning)",
    gradYear: "2024",
    track: "AI & Machine Learning",
    salaryBand: "$150k - $175k",
    avatar: "🤖",
    keyCourses: ["MATH 221", "CMSC 471", "CMSC 341"],
    credentials: ["AWS CCP", "DeepLearning.AI Spec"],
    skills: ["PyTorch", "Matrix Transformations", "Vector Databases", "MLOps", "Model Serving"],
    story: "Linear Algebra (MATH 221) and matrix operations are non-negotiable for understanding transformer attention mechanisms and vector search."
  },
  {
    id: "sarah-jenkins",
    name: "Sarah Jenkins",
    role: "Cloud Security & Infrastructure Engineer",
    company: "Northrop Grumman",
    gradYear: "2023",
    track: "Cloud & Infrastructure",
    salaryBand: "$140k - $160k",
    avatar: "🛡️",
    keyCourses: ["CMSC 421", "CMSC 481", "SCI 101"],
    credentials: ["CompTIA Security+", "AWS CCP"],
    skills: ["DevSecOps", "Zero Trust", "Firewall ACLs", "Network Packets", "Linux Hardening"],
    story: "Paired my CS degree with early micro-credentials. Having AWS CCP on my resume before sophomore internship fairs landed me 4 defense tech offers."
  }
];

export default function AlumniPathwaysView({ onSelectCredentialOrSkill }) {
  const [activeTrackFilter, setActiveTrackFilter] = useState("All");

  const filteredAlumni = ALUMNI_DATA.filter((a) => {
    if (activeTrackFilter === "All") return true;
    return a.track === activeTrackFilter;
  });

  return (
    <div className="notion-screen active">
      <div className="page-icon-wrapper">🌐</div>
      <h1 className="page-title">Alumni Pathways</h1>
      <p className="page-description">
        Explore verified alumni career trajectories, coursework paths, and micro-credential stacks from recent graduates.
      </p>

      {/* Aggregate Highlights */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "12px",
          marginBottom: "24px"
        }}
      >
        <div className="notion-callout" style={{ padding: "14px 16px", margin: 0 }}>
          <div style={{ fontSize: "20px" }}>💼</div>
          <div>
            <div style={{ fontSize: "11px", color: "var(--text-secondary)", textTransform: "uppercase" }}>Median Starting TC</div>
            <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-main)" }}>
              $138,500 <span style={{ fontSize: "11.5px", color: "var(--tag-green-text)" }}>+14% YoY</span>
            </div>
          </div>
        </div>

        <div className="notion-callout" style={{ padding: "14px 16px", margin: 0 }}>
          <div style={{ fontSize: "20px" }}>🏆</div>
          <div>
            <div style={{ fontSize: "11px", color: "var(--text-secondary)", textTransform: "uppercase" }}>Top Micro-Credential</div>
            <div style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-main)" }}>
              AWS CCP & Security+
            </div>
          </div>
        </div>

        <div className="notion-callout" style={{ padding: "14px 16px", margin: 0 }}>
          <div style={{ fontSize: "20px" }}>🏢</div>
          <div>
            <div style={{ fontSize: "11px", color: "var(--text-secondary)", textTransform: "uppercase" }}>Top Hiring Hubs</div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-main)" }}>
              AWS • Bloomberg • Capital One
            </div>
          </div>
        </div>
      </div>

      {/* Track Filter Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        {["All", "Cloud & Infrastructure", "Fullstack & Systems", "AI & Machine Learning"].map((track) => (
          <button
            key={track}
            className={`notion-btn ${activeTrackFilter === track ? "primary" : ""}`}
            style={{ fontSize: "12px", padding: "4px 12px" }}
            onClick={() => setActiveTrackFilter(track)}
          >
            {track}
          </button>
        ))}
      </div>

      {/* Alumni Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "16px" }}>
        {filteredAlumni.map((alum) => (
          <div
            key={alum.id}
            style={{
              background: "var(--bg-sidebar)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "8px",
              padding: "18px",
              display: "flex",
              flexDirection: "column",
              gap: "12px"
            }}
          >
            {/* Header: Name, Company, Avatar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "6px",
                    background: "rgba(255,255,255,0.06)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px"
                  }}
                >
                  {alum.avatar}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--text-main)" }}>
                    {alum.name}
                  </div>
                  <div style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}>
                    {alum.role} @ <strong style={{ color: "#fff" }}>{alum.company}</strong>
                  </div>
                </div>
              </div>
              <span className="notion-tag gray" style={{ fontSize: "11px" }}>
                Class of {alum.gradYear}
              </span>
            </div>

            {/* Quote / Reflection */}
            <div
              style={{
                fontSize: "12.5px",
                color: "var(--text-secondary)",
                lineHeight: "1.5",
                background: "var(--bg-callout)",
                padding: "10px 12px",
                borderRadius: "4px",
                borderLeft: "2px solid var(--tag-blue-text)"
              }}
            >
              "{alum.story}"
            </div>

            {/* Courses & Micro-Credentials */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ fontSize: "11.5px", color: "var(--text-tertiary)", fontWeight: 600 }}>
                CRITICAL COURSES TAKEN:
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {alum.keyCourses.map((c) => (
                  <span
                    key={c}
                    className="notion-tag blue"
                    style={{ fontSize: "11px", fontFamily: "monospace" }}
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>

            {/* Micro Credentials */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ fontSize: "11.5px", color: "var(--text-tertiary)", fontWeight: 600 }}>
                CERTIFICATIONS / CREDENTIALS:
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {alum.credentials.map((cred) => (
                  <span
                    key={cred}
                    className="notion-tag purple"
                    style={{ fontSize: "11px" }}
                  >
                    {cred}
                  </span>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ fontSize: "11.5px", color: "var(--text-tertiary)", fontWeight: 600 }}>
                CORE COMPETENCY STACK:
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {alum.skills.map((s) => (
                  <span
                    key={s}
                    className="notion-tag gray"
                    style={{ fontSize: "10.5px" }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
