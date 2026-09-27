import { ML_WIDGETS } from "./mlWidgets";

export const INITIAL_TRACKS = [
  {
    id: "cmsc313",
    code: "CMSC313",
    name: "Computer Organization & Assembly",
    type: "course",
    icon: "💻",
    tagColor: "blue"
  },
  {
    id: "cmsc341",
    code: "CMSC341",
    name: "Data Structures & Algorithms",
    type: "course",
    icon: "📘",
    tagColor: "blue"
  },
  {
    id: "sci101",
    code: "SCI101",
    name: "Intro to Physical Sciences",
    type: "course",
    icon: "🔬",
    tagColor: "green"
  },
  {
    id: "math221",
    code: "MATH221",
    name: "Linear Algebra",
    type: "course",
    icon: "📐",
    tagColor: "green"
  },
  {
    id: "econ102",
    code: "ECON102",
    name: "Principles of Microeconomics",
    type: "course",
    icon: "📊",
    tagColor: "orange"
  },
  {
    id: "aws_ccp",
    code: "AWS CCP",
    name: "AWS Certified Cloud Practitioner",
    type: "skill",
    icon: "☁️",
    tagColor: "purple"
  },
  {
    id: "git_skill",
    code: "Git & GitHub",
    name: "Version Control & Collaboration",
    type: "skill",
    icon: "🛠️",
    tagColor: "orange"
  },
  {
    id: "career_swe",
    code: "SWE Career & Pathways",
    name: "Software Engineering & Tech Pathways",
    type: "career",
    icon: "💼",
    tagColor: "blue"
  }
];

export const INITIAL_SESSIONS = [
  {
    id: "cmsc313-ram",
    trackId: "cmsc313",
    thread_id: "4d6d18ff-9d1f-4fa1-adc5-edb86c41570e",
    title: "RAM Architecture: SRAM vs DRAM",
    icon: "⚡",
    description: "Memory hierarchy, SRAM vs DRAM flip-flops, row buffers, and latency timings.",
    notes: `## Random Access Memory (RAM) Architecture
- **Primary Memory Hierarchy**: CPU Registers (sub-ns) ➔ L1/L2/L3 Cache (1-10ns) ➔ Main Memory / DRAM (50-100ns) ➔ NVMe/SSD.
- **SRAM vs DRAM**:
  - **SRAM (Static RAM)**: 6 transistors per bit cell (flip-flop circuit), ultra-fast, no periodic electrical refresh needed, used in on-chip caches.
  - **DRAM (Dynamic RAM)**: 1 transistor + 1 capacitor per bit cell, high density & cost-effective, requires periodic charge refresh (~64ms) due to capacitor dielectric leakage.
- **Key Concepts to Remember**:
  - **Row Buffer Locality**: Sequential access to the same DRAM row avoids precharge cycles.
  - **CAS Latency (tCL)**: Clock cycles between read command and data availability on the bus.`,
    widgetIds: ["ram-arch"],
    messages: [
      {
        id: "msg-101",
        role: "assistant",
        content: "Hello! I'm **Lumen**, your academic copilot for **CMSC 313 (Computer Organization & Assembly)**.\n\nI can explain low-level hardware structures, simulate memory hierarchies, and generate interactive visual aids. What are you studying today?",
        engine: "backboard",
        tool_executions: [],
        widgets: []
      },
      {
        id: "msg-102",
        role: "user",
        content: "Can you build me an interactive visualization comparing SRAM vs DRAM memory and explain capacitor leakage?"
      },
      {
        id: "msg-103",
        role: "assistant",
        engine: "backboard",
        content: `### SRAM vs DRAM Architecture & Physics

In computer architecture, memory speed, cost, and physical density represent a fundamental hardware tradeoff:

* **SRAM (Static RAM)**: Constructed using a bistable **6-transistor (6T CMOS)** cross-coupled inverter latch. It holds its state indefinitely as long as power is applied—no refresh cycles needed. Used for **L1, L2, and L3 CPU Caches** with sub-nanosecond access latencies.
* **DRAM (Dynamic RAM)**: Uses a minimalist **1-Transistor 1-Capacitor (1T1C)** cell. While dramatically smaller and cheaper per gigabyte (enabling 32GB+ of main system memory), the tiny trench capacitor naturally leaks charge through the dielectric substrate. Consequently, DRAM memory controllers must pulse every row with a **periodic refresh cycle (~64 ms)** to prevent bit flips and data loss.

Here is an interactive simulator where you can experiment with capacitor decay, trigger refresh pulses, and toggle the bistable SRAM inverter latch:`,
        tool_executions: [],
        widgets: [
          {
            id: "ram-interactive-sim",
            title: "SRAM vs DRAM Cell & Capacitor Refresh Simulator",
            concept: "CMSC 313 Memory Hierarchy",
            explanation: "Interact with the DRAM capacitor discharge and pulse the Wordline refresh cycle, or flip the cross-coupled SRAM inverters.",
            html_code: `<div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif; background:#09090b; color:#f4f4f5; padding:18px; border-radius:12px; border:1px solid #27272a;">
  <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #27272a; padding-bottom:12px; margin-bottom:16px;">
    <div>
      <h3 style="margin:0; font-size:14px; font-weight:700; color:#38bdf8;">Memory Cell Architecture Simulator</h3>
      <p style="margin:2px 0 0 0; font-size:11px; color:#71717a;">CMSC 313 • Hardware Invariants</p>
    </div>
    <div style="display:flex; gap:6px;">
      <button onclick="setTab('dram')" id="btn-dram" style="background:#3b82f6; color:#fff; border:none; padding:4px 10px; border-radius:6px; font-size:11px; cursor:pointer; font-weight:600;">DRAM (1T1C)</button>
      <button onclick="setTab('sram')" id="btn-sram" style="background:#18181b; color:#a1a1aa; border:1px solid #27272a; padding:4px 10px; border-radius:6px; font-size:11px; cursor:pointer; font-weight:600;">SRAM (6T Latch)</button>
    </div>
  </div>

  <div id="tab-dram" style="display:block;">
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; align-items:center;">
      <div style="background:#18181b; padding:14px; border-radius:8px; border:1px solid #27272a;">
        <div style="font-size:11px; color:#a1a1aa; margin-bottom:8px;">Capacitor Charge Level (Dielectric Decay):</div>
        <div style="width:100%; height:22px; background:#09090b; border-radius:6px; overflow:hidden; border:1px solid #3f3f46; position:relative;">
          <div id="cap-bar" style="width:85%; height:100%; background:#10b981; transition:width 0.3s, background 0.3s;"></div>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:11px; margin-top:6px; font-family:monospace;">
          <span id="charge-text" style="color:#10b981;">Charge: 85% (Logic 1)</span>
          <span style="color:#71717a;">Period: ~64ms</span>
        </div>
      </div>
      <div style="display:flex; flex-direction:column; gap:8px;">
        <button onclick="pulseRefresh()" style="background:#10b981; color:#fff; border:none; padding:8px 12px; border-radius:6px; font-size:11px; font-weight:600; cursor:pointer;">⚡ Pulse DRAM Refresh Cycle</button>
        <button onclick="simulateLeak()" style="background:#f59e0b; color:#fff; border:none; padding:8px 12px; border-radius:6px; font-size:11px; font-weight:600; cursor:pointer;">⏳ Simulate Charge Leakage (-25%)</button>
      </div>
    </div>
    <div id="dram-status" style="margin-top:12px; font-size:11px; color:#d4d4d8; background:#18181b; padding:8px 12px; border-radius:6px; border:1px solid #27272a;">
      • <strong>Status:</strong> Capacitor holds stable charge. Sense amplifiers reliably decode state as bit 1.
    </div>
  </div>

  <div id="tab-sram" style="display:none;">
    <div style="background:#18181b; padding:14px; border-radius:8px; border:1px solid #27272a;">
      <div style="display:flex; justify-content:space-around; align-items:center; text-align:center;">
        <div style="padding:10px 14px; background:#09090b; border-radius:8px; border:1px solid #38bdf8;">
          <div style="font-size:10px; color:#a1a1aa;">Inverter 1</div>
          <div id="q-val" style="font-size:15px; font-weight:800; color:#38bdf8; margin:4px 0;">Q = 1</div>
          <div style="font-size:10px; color:#38bdf8;">Vdd (High)</div>
        </div>
        <div style="font-size:16px; color:#71717a; font-weight:bold;">⇄ Feedback</div>
        <div style="padding:10px 14px; background:#09090b; border-radius:8px; border:1px solid #f43f5e;">
          <div style="font-size:10px; color:#a1a1aa;">Inverter 2</div>
          <div id="qbar-val" style="font-size:15px; font-weight:800; color:#f43f5e; margin:4px 0;">Q̄ = 0</div>
          <div style="font-size:10px; color:#f43f5e;">GND (Low)</div>
        </div>
      </div>
      <div style="display:flex; justify-content:center; gap:10px; margin-top:14px;">
        <button onclick="flipSRAM(1)" style="background:#38bdf8; color:#09090b; border:none; padding:6px 14px; border-radius:6px; font-size:11px; font-weight:700; cursor:pointer;">Set Bit = 1</button>
        <button onclick="flipSRAM(0)" style="background:#f43f5e; color:#fff; border:none; padding:6px 14px; border-radius:6px; font-size:11px; font-weight:700; cursor:pointer;">Set Bit = 0</button>
      </div>
    </div>
    <div style="margin-top:12px; font-size:11px; color:#d4d4d8; background:#18181b; padding:8px 12px; border-radius:6px; border:1px solid #27272a;">
      • <strong>SRAM Architecture:</strong> 6 Transistors form a bistable cross-coupled feedback loop. Retains data indefinitely without electrical refresh pulses. Used in CPU L1/L2 caches.
    </div>
  </div>
</div>
<script>
  let dramCharge = 85;
  function setTab(tab) {
    document.getElementById('tab-dram').style.display = tab === 'dram' ? 'block' : 'none';
    document.getElementById('tab-sram').style.display = tab === 'sram' ? 'block' : 'none';
    document.getElementById('btn-dram').style.background = tab === 'dram' ? '#3b82f6' : '#18181b';
    document.getElementById('btn-dram').style.color = tab === 'dram' ? '#fff' : '#a1a1aa';
    document.getElementById('btn-sram').style.background = tab === 'sram' ? '#3b82f6' : '#18181b';
    document.getElementById('btn-sram').style.color = tab === 'sram' ? '#fff' : '#a1a1aa';
  }
  function pulseRefresh() {
    dramCharge = 100;
    updateDramUI();
    document.getElementById('dram-status').innerHTML = '• <strong>Refresh Applied:</strong> Wordline pulsed. Sense amp recharged capacitor back to 100%.';
  }
  function simulateLeak() {
    dramCharge = Math.max(0, dramCharge - 25);
    updateDramUI();
  }
  function updateDramUI() {
    const bar = document.getElementById('cap-bar');
    const txt = document.getElementById('charge-text');
    bar.style.width = dramCharge + '%';
    if (dramCharge > 60) {
      bar.style.background = '#10b981';
      txt.style.color = '#10b981';
      txt.innerText = 'Charge: ' + dramCharge + '% (Logic 1)';
    } else if (dramCharge >= 35) {
      bar.style.background = '#f59e0b';
      txt.style.color = '#f59e0b';
      txt.innerText = 'Charge: ' + dramCharge + '% (Warning: Decaying)';
      document.getElementById('dram-status').innerHTML = '• <strong>Warning:</strong> Charge near sense threshold. Refresh needed before data loss.';
    } else {
      bar.style.background = '#ef4444';
      txt.style.color = '#ef4444';
      txt.innerText = 'Charge: ' + dramCharge + '% (Logic 0 / Discharged)';
      document.getElementById('dram-status').innerHTML = '• <strong>Data Loss:</strong> Capacitor drained below threshold. Interpreted as bit 0.';
    }
  }
  function flipSRAM(val) {
    const q = document.getElementById('q-val');
    const qbar = document.getElementById('qbar-val');
    if (val === 1) {
      q.innerText = 'Q = 1';
      q.style.color = '#38bdf8';
      qbar.innerText = 'Q̄ = 0';
      qbar.style.color = '#f43f5e';
    } else {
      q.innerText = 'Q = 0';
      q.style.color = '#f43f5e';
      qbar.innerText = 'Q̄ = 1';
      qbar.style.color = '#38bdf8';
    }
  }
</script>`
          }
        ]
      }
    ]
  },
  {
    id: "cmsc341-career-roi",
    trackId: "cmsc341",
    thread_id: "637820f8-42ec-4501-ac62-6c5bee48cc64",
    title: "Career ROI & Prerequisites",
    icon: "📊",
    description: "Alumni starting salaries, internship correlation, and prerequisite sequencing.",
    notes: `## CMSC 341 Career & Prerequisite Bridge
- **Gateway Course**: CMSC 341 is the central prerequisite for CMSC 441 (Algorithms) and CMSC 421 (Operating Systems).
- **Internship Impact**: UMBC CS alumni with 2+ internships average over $92k first-year compensation.`,
    widgetIds: ["linked-list-ops", "avl-rot"],
    messages: [
      {
        id: "msg-201",
        role: "assistant",
        content: "Welcome to your study session on **CMSC 341 Data Structures**!\n\nI have real-time access to the UMBC campus dataset and can query course requirements, analyze alumni salaries, or generate interactive widgets for you. How can I help you today?",
        engine: "backboard",
        tool_executions: [],
        widgets: []
      },
      {
        id: "msg-202",
        role: "user",
        content: "What starting salaries and top employers do UMBC Computer Science grads with 2+ internships get compared to 0 internships, and what upper-level courses should I take next?"
      },
      {
        id: "msg-203",
        role: "assistant",
        engine: "backboard",
        content: `### UMBC Computer Science Alumni ROI Analysis

According to the campus alumni career dataset, internships have a dramatic impact on first-job placement and starting compensation for UMBC CS majors:

* **2+ Internships**: Average starting salary of **$92,400** with **1.2 months** average time to first job. Top employers include **Amazon AWS**, **Northrop Grumman**, and **T. Rowe Price**.
* **1 Internship**: Average starting salary of **$78,600** (2.8 months to placement).
* **0 Internships**: Average starting salary of **$66,500** (5.4 months to placement).

### Recommended Course Progression Post-CMSC 341
Passing **CMSC 341 (Data Structures)** unlocks the core upper-level gateways:
1. **CMSC 441 (Algorithms)** — Critical for technical whiteboard interviews and SWE salary bands.
2. **CMSC 421 (Operating Systems)** — Required for systems engineering and cloud infrastructure roles.
3. **CMSC 461 (Database Systems)** — High ROI for backend and distributed data pipelines.`,
        tool_executions: [
          {
            tool: "query_campus_database",
            query: "SELECT CASE WHEN CAST(a.internship_count AS INT) >= 2 THEN '2+ Internships' WHEN CAST(a.internship_count AS INT) = 1 THEN '1 Internship' ELSE '0 Internships' END AS intern_tier, COUNT(DISTINCT a.campus_id) AS alumni_count, ROUND(AVG(CAST(e.annual_salary_usd AS INT)), 0) AS avg_first_salary, ROUND(AVG(CAST(a.months_to_first_job AS FLOAT)), 1) AS avg_months_to_job FROM alumni a JOIN employment_history e ON a.campus_id = e.campus_id WHERE a.major = 'Computer Science' AND e.change_type = 'First Job' GROUP BY intern_tier ORDER BY avg_first_salary DESC;",
            rationale: "Querying UMBC alumni career dataset for Computer Science starting salaries by internship tier",
            columns: ["intern_tier", "alumni_count", "avg_first_salary", "avg_months_to_job"],
            rows: [
              { intern_tier: "2+ Internships", alumni_count: 54, avg_first_salary: "$92,400", avg_months_to_job: "1.2 mos" },
              { intern_tier: "1 Internship", alumni_count: 48, avg_first_salary: "$78,600", avg_months_to_job: "2.8 mos" },
              { intern_tier: "0 Internships", alumni_count: 32, avg_first_salary: "$66,500", avg_months_to_job: "5.4 mos" }
            ],
            row_count: 3,
            success: true
          }
        ],
        widgets: []
      }
    ]
  },
  {
    id: "cmsc441-degree-audit",
    trackId: "cmsc341",
    thread_id: "ad057b26-d51e-4e5e-8b83-e1be4f9e2198",
    title: "Algorithms & Degree Audit",
    icon: "🎯",
    description: "Four-Year Plan audit, prerequisite bottleneck analysis, and course difficulty ratings.",
    notes: `## Degree Audit & Prerequisite Pathways
- **Hardest Core Courses**: CMSC 441 (4.4), CMSC 421 (4.3), CMSC 341 (4.1).
- **MATH Requirements**: MATH 301 is a strict co-requisite/prerequisite for CMSC 441.`,
    widgetIds: ["avl-rot"],
    messages: [
      {
        id: "msg-301",
        role: "assistant",
        content: "Hello! I'm Lumen. Looking at your **Four Year Plan**, you are currently on track for Fall 2026. How can I help you plan your prerequisites or study today?",
        engine: "backboard",
        tool_executions: [],
        widgets: []
      },
      {
        id: "msg-302",
        role: "user",
        content: "Can you check my degree audit? What is the hardest prerequisite bottleneck for graduating on time?"
      },
      {
        id: "msg-303",
        role: "assistant",
        engine: "backboard",
        content: `### Degree Audit & Prerequisite Bottlenecks

Your most critical degree milestone is **CMSC 341 (Data Structures)**. It acts as the primary sequential gateway for almost all 400-level requirements:

* **Primary Dependency Chain**:
  \`CMSC 202 + 203\` ➔ **\`CMSC 341\`** ➔ **\`CMSC 441 (Difficulty: 4.4)\`** & **\`CMSC 421 (Difficulty: 4.3)\`** ➔ **\`CMSC 447 Capstone\`**.

* **Recommendation for Four-Year Plan**:
  Ensure you enroll in \`MATH 301\` concurrently with or immediately after \`CMSC 341\`. Failing to complete MATH 301 will block you from taking CMSC 441 in your junior spring semester, pushing your capstone sequence back by an entire year.`,
        tool_executions: [
          {
            tool: "query_campus_database",
            query: "SELECT course_id, course_title, CAST(difficulty_index AS REAL) AS difficulty, prerequisite_ids, required_for_majors FROM course_catalog WHERE course_id IN ('CMSC202', 'CMSC203', 'CMSC313', 'CMSC341', 'CMSC441', 'CMSC421') ORDER BY difficulty DESC;",
            rationale: "Retrieve prerequisite bottleneck chain and difficulty ratings for UMBC CS core",
            columns: ["course_id", "course_title", "difficulty", "prerequisite_ids", "required_for_majors"],
            rows: [
              { course_id: "CMSC441", course_title: "Design and Analysis of Algorithms", difficulty: 4.4, prerequisite_ids: "CMSC341|MATH301", required_for_majors: "Computer Science" },
              { course_id: "CMSC421", course_title: "Principles of Operating Systems", difficulty: 4.3, prerequisite_ids: "CMSC341|CMSC313", required_for_majors: "Computer Science" },
              { course_id: "CMSC341", course_title: "Data Structures", difficulty: 4.1, prerequisite_ids: "CMSC202|CMSC203", required_for_majors: "Computer Science" },
              { course_id: "CMSC313", course_title: "Computer Organization & Assembly", difficulty: 3.7, prerequisite_ids: "CMSC201", required_for_majors: "Computer Science" }
            ],
            row_count: 4,
            success: true
          }
        ],
        widgets: []
      }
    ]
  },
  {
    id: "aws-load-balancing",
    trackId: "aws_ccp",
    title: "AWS Elastic Load Balancing",
    icon: "⚖️",
    description: "Application vs Network Load Balancer, target groups and health checks.",
    notes: `## AWS Elastic Load Balancing (ELB) Architecture
- **ALB (Application Load Balancer)**: OSI Layer 7 (HTTP/HTTPS/gRPC).
- **NLB (Network Load Balancer)**: OSI Layer 4 (TCP/UDP/TLS).`,
    widgetIds: ["aws-alb-balancer"],
    messages: []
  },
  {
    id: "git-rebase-workflow",
    trackId: "git_skill",
    title: "Interactive Rebase & Branching",
    icon: "🛠️",
    description: "Git rebase vs merge, commit history squashing, and conflict resolution workflows.",
    notes: `## Git Workflow & Branching
- Rebase: linear history replay.
- Merge: preserved topological commit graph.`,
    widgetIds: ["git-rebase"],
    messages: []
  },
  {
    id: "swe-internship-prep",
    trackId: "career_swe",
    title: "SWE Internship & Resume Strategy",
    icon: "💼",
    description: "Technical interview prep, resume tailoring, and campus career fair roadmap.",
    notes: `## SWE Career Readiness
- Target 2+ internships prior to graduation for optimal salary tier placement.
- Emphasize systems projects and data structures proficiency.`,
    widgetIds: [],
    messages: []
  }
];
// Widgets start empty — only widgets generated by Lumen during sessions are saved here.
export const INITIAL_WIDGETS = [];
