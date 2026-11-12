export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");

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

export async function sendSessionMessage(message, history = [], courseContext = null, model = null) {
  try {
    const res = await fetch(`${API_BASE_URL}/sessions/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        history,
        course_context: courseContext,
        model: model || null
      })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("Error sending message to session:", err);
  }
  return {
    role: "assistant",
    content: "I'm having trouble connecting to the Lumen backend service. Please check your backend connection.",
    tool_executions: [],
    widgets: [],
    status: "error"
  };
}

