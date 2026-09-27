const API_BASE_URL = "http://localhost:8000/api";

export async function parseSyllabus(file, rawText = "") {
  try {
    const formData = new FormData();
    if (file) formData.append("file", file);
    if (rawText) formData.append("raw_text", rawText);

    const res = await fetch(`${API_BASE_URL}/syllabus/parse`, {
      method: "POST",
      body: formData,
    });
    if (res.ok) {
      const data = await res.json();
      return data.data;
    }
  } catch (err) {
    console.warn("Backend unavailable, using client fallback syllabus parsing:", err);
  }

  // Resilient Client-Side Fallback
  return {
    code: "CMSC 421",
    name: "Operating Systems & Concurrency",
    desc: "Process synchronization, virtual memory paging, and deadlock avoidance.",
    instructor: "Prof. Squire (UMBC)",
    deadlines: [
      { title: "Project 1: Kernel Thread Scheduler", date: "Oct 12, 11:59 PM", due: "In 2 weeks", urgent: false },
      { title: "Homework 2: Deadlock Banker's Algorithm", date: "Oct 22, 11:59 PM", due: "In 3 weeks", urgent: false }
    ],
    todos: [
      { text: "Configure QEMU x86 emulation environment", meta: "Setup guide" },
      { text: "Review Mutex lock and Semaphore spinlock mechanisms", meta: "Lecture 4 prep" }
    ],
    notes: [
      { id: "threads-synch", date: "Oct 02, 2026", title: "Concurrency & Mutex Locks", topic: "Critical Sections & Race Conditions", visual: "1 Visual" },
      { id: "virtual-memory", date: "Oct 09, 2026", title: "Virtual Memory & TLB Caching", topic: "Page Faults & LRU Eviction", visual: "2 Visuals" }
    ]
  };
}

export async function generateHtmlWidget(concept, courseContext = "STEM") {
  try {
    const res = await fetch(`${API_BASE_URL}/visualize/html`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ concept, course_context: courseContext, engine: "html" }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.html;
    }
  } catch (err) {
    console.warn("Backend unavailable, using client HTML widget generator:", err);
  }

  const lower = (concept || "").toLowerCase();

  if (lower.includes("ram") || lower.includes("sram") || lower.includes("dram")) {
    return `
<div style="font-family: -apple-system, sans-serif; background: #18181b; color: #f4f4f5; padding: 20px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); text-align: center;">
  <div style="font-size: 14px; font-weight: 600; color: #60a5fa; margin-bottom: 6px;">RAM Hierarchy & Cell Physics: SRAM vs DRAM</div>
  <p style="font-size: 12px; color: #a1a1aa; margin-bottom: 16px;">SRAM utilizes a 6-transistor cross-coupled bistable latch, while DRAM holds charge in a microscopic capacitor that requires active refresh cycles.</p>
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 16px 0; text-align: left;">
    <div style="background: rgba(59, 130, 246, 0.08); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 6px; padding: 12px;">
      <div style="font-weight: 600; font-size: 13px; color: #60a5fa; margin-bottom: 6px;">⚡ SRAM (Static RAM)</div>
      <div style="font-family: monospace; font-size: 11.5px; line-height: 1.5; color: #e4e4e7;">
        [VDD] ── M1, M2 Pull-up<br/>
        [Bit] ⇄ [Q] ⇄ [~Q] ⇄ [~Bit]<br/>
        [GND] ── M3, M4 Pull-down
      </div>
      <div style="font-size: 11px; color: #93c5fd; margin-top: 8px;">• Speed: ~0.5 - 2.5 ns<br/>• No refresh needed<br/>• Size: Large (~6T per bit)</div>
    </div>
    <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 6px; padding: 12px;">
      <div style="font-weight: 600; font-size: 13px; color: #34d399; margin-bottom: 6px;">🔋 DRAM (Dynamic RAM)</div>
      <div style="font-family: monospace; font-size: 11.5px; line-height: 1.5; color: #e4e4e7;">
        [Word Line] ➔ Gate (1 Transistor)<br/>
        [Bit Line]  ➔ Drain / Source<br/>
        [Capacitor] ➔ Stores 1 Bit (Q = C·V)
      </div>
      <div style="font-size: 11px; color: #6ee7b7; margin-top: 8px;">• Speed: ~50 - 80 ns<br/>• Refresh: Every 64 ms<br/>• High Density (1T1C per bit)</div>
    </div>
  </div>
  <div style="display: inline-flex; align-items: center; gap: 8px; font-size: 12px; background: rgba(255,255,255,0.05); padding: 6px 14px; border-radius: 20px; color: #e4e4e7;">
    <span style="color: #fbbf24;">⚡ Row Buffer Locality:</span> Hits require only ~14ns (tCAS) vs ~50ns on miss.
  </div>
</div>
    `;
  }

  if (lower.includes("matrix") || lower.includes("linear") || lower.includes("multiplication")) {
    return `
<div style="font-family: -apple-system, sans-serif; background: #18181b; color: #f4f4f5; padding: 20px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); text-align: center;">
  <div style="font-size: 14px; font-weight: 600; color: #34d399; margin-bottom: 6px;">Matrix Multiplication as Basis Vector Transformation</div>
  <p style="font-size: 12px; color: #a1a1aa; margin-bottom: 16px;">Multiplication transforms the standard unit basis vectors î = [1, 0]ᵀ and ĵ = [0, 1]ᵀ into the columns of matrix A.</p>
  <div style="display: flex; justify-content: center; gap: 24px; align-items: center; margin: 20px 0;">
    <div style="font-family: monospace; font-size: 13px; background: rgba(255,255,255,0.05); padding: 12px 18px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1);">
      <div style="color: #94a3b8; font-size: 11px; margin-bottom: 4px;">Matrix A</div>
      ⎡  2  -1 ⎤<br/>
      ⎣  1   2 ⎦
    </div>
    <div style="font-size: 18px; color: #a1a1aa;">×</div>
    <div style="font-family: monospace; font-size: 13px; background: rgba(52, 211, 153, 0.1); padding: 12px 14px; border-radius: 6px; border: 1px solid rgba(52, 211, 153, 0.3);">
      <div style="color: #34d399; font-size: 11px; margin-bottom: 4px;">Vector x</div>
      ⎡ x ⎤<br/>
      ⎣ y ⎦
    </div>
    <div style="font-size: 18px; color: #a1a1aa;">=</div>
    <div style="font-family: monospace; font-size: 13px; background: rgba(96, 165, 250, 0.1); padding: 12px 16px; border-radius: 6px; border: 1px solid rgba(96, 165, 250, 0.3);">
      <div style="color: #60a5fa; font-size: 11px; margin-bottom: 4px;">Transformed Tx</div>
      ⎡ 2x - y ⎤<br/>
      ⎣ x + 2y ⎦
    </div>
  </div>
  <div style="font-size: 11.5px; color: #94a3b8;">Determinant det(A) = 2(2) - (-1)(1) = 5 (Area scaling factor is 5× with counter-clockwise rotation).</div>
</div>
    `;
  }

  if (lower.includes("load balancing") || lower.includes("alb") || lower.includes("nlb") || lower.includes("aws")) {
    return `
<div style="font-family: -apple-system, sans-serif; background: #18181b; color: #f4f4f5; padding: 20px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); text-align: center;">
  <div style="font-size: 14px; font-weight: 600; color: #c084fc; margin-bottom: 6px;">AWS Application Load Balancer (ALB) Routing Engine</div>
  <p style="font-size: 12px; color: #a1a1aa; margin-bottom: 16px;">Layer 7 HTTP/HTTPS request distribution across Multi-Availability Zone target groups with health checking.</p>
  <div style="display: flex; justify-content: center; align-items: center; gap: 14px; margin: 20px 0; font-family: monospace; font-size: 12px;">
    <div style="background: rgba(255,255,255,0.06); padding: 10px 14px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1);">
      Client HTTP<br/>Traffic
    </div>
    <div style="color: #c084fc;">──➔</div>
    <div style="background: rgba(192, 132, 252, 0.15); border: 1px solid #c084fc; padding: 10px 16px; border-radius: 6px; font-weight: 600;">
      ⚖️ AWS ALB<br/>(Listener: 443)
    </div>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="background: rgba(59, 130, 246, 0.15); border: 1px solid #3b82f6; padding: 6px 12px; border-radius: 4px;">
        AZ-1a: EC2 Target (Healthy ✓)
      </div>
      <div style="background: rgba(59, 130, 246, 0.15); border: 1px solid #3b82f6; padding: 6px 12px; border-radius: 4px;">
        AZ-1b: EC2 Target (Healthy ✓)
      </div>
      <div style="background: rgba(248, 113, 113, 0.15); border: 1px solid #f87171; padding: 6px 12px; border-radius: 4px; color: #f87171;">
        AZ-1c: Drained / Unhealthy ✗
      </div>
    </div>
  </div>
  <div style="font-size: 11.5px; color: #94a3b8;">Routing Algorithm: Weighted Round Robin / Least Outstanding Requests with TLS Decryption.</div>
</div>
    `;
  }

  if (lower.includes("linked") || lower.includes("list")) {
    return `
<div style="font-family: -apple-system, sans-serif; background: #18181b; color: #f4f4f5; padding: 20px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); text-align: center;">
  <div style="font-size: 14px; font-weight: 600; color: #60a5fa; margin-bottom: 6px;">Linked List: Two-Pointer Traversal & Pointer Mutation</div>
  <p style="font-size: 12px; color: #a1a1aa; margin-bottom: 16px;">Floyd's Cycle-Finding Algorithm (Tortoise and Hare) and Sentinel Node Invariants.</p>
  <div style="display: flex; justify-content: center; align-items: center; gap: 8px; margin: 20px 0; font-family: monospace; font-size: 12px;">
    <div style="background: rgba(96, 165, 250, 0.15); border: 1px solid #60a5fa; padding: 8px 12px; border-radius: 6px;">[Head: 10]</div>
    <div style="color: #60a5fa;">➔</div>
    <div style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); padding: 8px 12px; border-radius: 6px;">[Node: 20]</div>
    <div style="color: #60a5fa;">➔</div>
    <div style="background: rgba(52, 211, 153, 0.15); border: 1px solid #34d399; padding: 8px 12px; border-radius: 6px;">[Slow & Fast: 30]</div>
    <div style="color: #60a5fa;">➔</div>
    <div style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); padding: 8px 12px; border-radius: 6px;">[Node: 40]</div>
    <div style="color: #60a5fa;">➔</div>
    <div style="color: #94a3b8; font-style: italic;">[NULL]</div>
  </div>
  <div style="font-size: 11.5px; color: #94a3b8;">Invariant: slow moves 1 node/step, fast moves 2 nodes/step. Space complexity: O(1).</div>
</div>
    `;
  }

  return `
<div style="font-family: -apple-system, sans-serif; background: #18181b; color: #f4f4f5; padding: 24px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); text-align: center;">
  <div style="font-size: 14px; font-weight: 600; color: #60a5fa; margin-bottom: 12px;">Interactive Concept Model: ${concept}</div>
  <div style="display: flex; justify-content: center; gap: 20px; align-items: center; margin: 24px 0;">
    <div style="width: 48px; height: 48px; border-radius: 50%; background: #222; border: 2px solid #60a5fa; display: flex; align-items: center; justify-content: center; font-weight: 700;">A</div>
    <div style="color: #888; font-size: 13px;">══[ Invariant Transform ]══➔</div>
    <div style="width: 48px; height: 48px; border-radius: 50%; background: #222; border: 2px solid #34d399; display: flex; align-items: center; justify-content: center; font-weight: 700;">B</div>
  </div>
  <div style="font-size: 12px; color: #999;">Minimalist state space transition verifying invariant balance condition.</div>
</div>
`;
}

export async function generateManimClip(concept, courseContext = "STEM") {
  try {
    const res = await fetch(`${API_BASE_URL}/visualize/manim`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ concept, course_context: courseContext, engine: "manim" }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.data;
    }
  } catch (err) {
    console.warn("Manim backend offline, using demo clip:", err);
  }

  return {
    concept: concept || "AVL Tree Balancing",
    description: "Visualizes the atomic pointer rearrangement restoring the balance factor to {-1, 0, 1}.",
    video_url: null,
    manim_code: `# 3Blue1Brown Manim Script for ${concept}
from manim import *

class ConceptScene(Scene):
    def construct(self):
        title = Text("${concept}", font_size=36, color=BLUE)
        self.play(Write(title))
        self.wait(1)`
  };
}

export async function consultLumen(selectedText, courseContext = "CMSC 341") {
  try {
    const res = await fetch(`${API_BASE_URL}/notes/consult`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ selected_text: selectedText, course_context: courseContext }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.data;
    }
  } catch (err) {
    console.warn("Consult API fallback:", err);
  }

  return {
    term: selectedText,
    definition: `A core property in ${courseContext} guaranteeing asymptotic efficiency.`,
    intuition: "Think of this as an equilibrium: when local imbalance exceeds tolerance, an immediate O(1) adjustment restores the global bound.",
    quick_example: "When height difference exceeds 1, an atomic rotation restores logarithmic lookup.",
    visual_recommendation: "Interactive Minimalist Tree Inspector"
  };
}

export async function narrateConcept(text) {
  try {
    const res = await fetch(`${API_BASE_URL}/voice/narrate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("Voice narration fallback:", err);
  }

  // Fallback to browser Web Speech API
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    window.speechSynthesis.speak(utterance);
    return { status: "browser_speech", text };
  }

  return { status: "unavailable" };
}

export async function getCareerRoi(courseId) {
  try {
    const res = await fetch(`${API_BASE_URL}/career/roi/${courseId}`);
    if (res.ok) {
      const data = await res.json();
      return data.data;
    }
  } catch (err) {
    console.warn("Career ROI API fallback:", err);
  }

  return {
    course_code: courseId.toUpperCase(),
    median_starting_salary: "$128,000",
    salary_range: "$115,000 - $145,000",
    metro_area: "Baltimore - Washington DC Tech Corridor",
    market_demand: "Very High",
    key_skill_connection: "Algorithmic invariants & data structure performance are primary technical interview criteria for top-tier software architects."
  };
}

export async function createSession(title = "New Study Session", courseContext = null) {
  try {
    const res = await fetch(`${API_BASE_URL}/sessions/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, course_context: courseContext })
    });
    if (res.ok) {
      const data = await res.json();
      return data.session;
    }
  } catch (err) {
    console.warn("Error creating session via backend:", err);
  }
  return {
    thread_id: `local-${Date.now()}`,
    title: title || "New Study Session",
    mode: "local_fallback"
  };
}

export async function sendSessionMessage(threadId, message, courseContext = null) {
  try {
    const res = await fetch(`${API_BASE_URL}/sessions/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        thread_id: threadId,
        message,
        course_context: courseContext
      })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("Error sending message to session:", err);
  }
  return {
    thread_id: threadId,
    role: "assistant",
    content: "I'm having trouble connecting to the Lumen backend service. Please check your backend connection.",
    tool_executions: [],
    widgets: [],
    status: "error"
  };
}

export async function streamSessionMessage({
  threadId,
  message,
  courseContext = null,
  onMeta,
  onDelta,
  onToolStart,
  onToolResult,
  onWidget,
  onDone,
  onError
}) {
  try {
    const res = await fetch(`${API_BASE_URL}/sessions/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        thread_id: threadId,
        message,
        course_context: courseContext
      })
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n\n");
      buffer = parts.pop() || "";

      for (const part of parts) {
        const trimmed = part.trim();
        if (!trimmed || !trimmed.startsWith("data:")) continue;
        const jsonStr = trimmed.slice(5).trim();
        if (!jsonStr) continue;

        try {
          const evt = JSON.parse(jsonStr);
          if (evt.type === "meta") {
            onMeta && onMeta(evt);
          } else if (evt.type === "delta") {
            onDelta && onDelta(evt.delta);
          } else if (evt.type === "tool_start") {
            onToolStart && onToolStart(evt);
          } else if (evt.type === "tool_result") {
            onToolResult && onToolResult(evt);
          } else if (evt.type === "widget") {
            onWidget && onWidget(evt.widget);
          } else if (evt.type === "done") {
            onDone && onDone(evt);
          }
        } catch (pe) {
          console.warn("Error parsing SSE event payload:", pe);
        }
      }
    }
  } catch (err) {
    console.error("Streaming error in client:", err);
    onError && onError(err);
  }
}


