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
    type: "credential",
    icon: "☁️",
    tagColor: "purple"
  }
];

export const INITIAL_SESSIONS = [
  {
    id: "cmsc313-ram",
    trackId: "cmsc313",
    title: "RAM",
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
    widgetIds: ["ram-arch"]
  },
  {
    id: "cmsc341-linked-lists",
    trackId: "cmsc341",
    title: "Linked Lists",
    icon: "🔗",
    description: "Pointer-based linear chains, head/tail sentinels, reversal invariants, and cycle detection.",
    notes: `## Linked List Operations & Pointer Invariants
- **Pointer Manipulation Invariants**:
  - Always preserve the next-pointer reference before breaking edges: \`Node* next = curr->next;\`
  - Maintain sentinel nodes (\`head\` and \`tail\`) to eliminate null pointer branch checks in \`insert()\` and \`delete()\`.
- **Fast and Slow Pointer Algorithm (Floyd's Cycle Finding)**:
  - Slow pointer advances 1 step: \`slow = slow->next;\`
  - Fast pointer advances 2 steps: \`fast = fast->next->next;\`
  - If \`slow == fast\`, a directed loop exists. Time: O(N), Space: O(1).`,
    widgetIds: ["linked-list-ops", "avl-rot"]
  },
  {
    id: "math221-matrix-mult",
    trackId: "math221",
    title: "Matrix Multiplication",
    icon: "📐",
    description: "Row-column inner products, linear coordinate transformations, and non-commutativity.",
    notes: `## Matrix Multiplication & Linear Maps
- **Definition & Compatibility**:
  - Given A in R^(m×k) and B in R^(k×n), the product C = AB in R^(m×n).
  - Element formula: C_ij = sum_{r=1}^k A_ir * B_rj (dot product of row i of A and column j of B).
- **Geometric Interpretation**:
  - Multiplying vectors by a matrix transforms basis vectors i-hat and j-hat.
  - Composition of maps: (AB)x = A(Bx) applies transformation B first, then A.
  - Generally non-commutative: AB != BA.`,
    widgetIds: ["matrix-transform", "eigen-transform"]
  },
  {
    id: "aws-load-balancing",
    trackId: "aws_ccp",
    title: "Load Balancing",
    icon: "⚖️",
    description: "AWS Elastic Load Balancing (ELB), Application vs Network Load Balancer, target groups and health checks.",
    notes: `## AWS Elastic Load Balancing (ELB) Architecture
- **ELB Types**:
  - **ALB (Application Load Balancer)**: OSI Layer 7 (HTTP/HTTPS/gRPC). Path-based routing (/api, /app), host routing, SSL termination, target groups with EC2/ECS/Lambda.
  - **NLB (Network Load Balancer)**: OSI Layer 4 (TCP/UDP/TLS). Ultra-high throughput, millions of requests/sec with ultra-low latency, static elastic IP per AZ.
  - **GWLB (Gateway Load Balancer)**: Third-party virtual appliances (firewalls, IDS/IPS).
- **Core Reliability Patterns**:
  - **Target Groups**: Logical pools of targets receiving health-checked traffic.
  - **Cross-Zone Load Balancing**: Evenly distributes requests across targets in all enabled Availability Zones.
  - **Sticky Sessions**: Cookie-based routing to preserve local user state.`,
    widgetIds: ["aws-alb-balancer"]
  }
];

export const INITIAL_WIDGETS = [
  {
    id: "ram-arch",
    title: "RAM Architecture: SRAM vs DRAM Cell & Refresh Cycle",
    trackId: "cmsc313",
    trackCode: "CMSC313",
    trackType: "course",
    trackTag: "blue",
    engine: "Interactive HTML/SVG",
    topic: "Memory Hierarchy & Cell Electronics",
    desc: "Simulates capacitive discharge in DRAM 1T1C cells versus 6T bistable SRAM flip-flop latches.",
    previewType: "ram"
  },
  {
    id: "linked-list-ops",
    title: "Linked List: Cycle Detection & In-Place Pointer Inversion",
    trackId: "cmsc341",
    trackCode: "CMSC341",
    trackType: "course",
    trackTag: "blue",
    engine: "Interactive HTML/SVG",
    topic: "Pointer Manipulation Invariants",
    desc: "Visualizes tortoise-and-hare two-pointer traversal meeting invariant and O(1) memory link reversal.",
    previewType: "list"
  },
  {
    id: "avl-rot",
    title: "AVL Tree: Single Right & Left-Right Rotations",
    trackId: "cmsc341",
    trackCode: "CMSC341",
    trackType: "course",
    trackTag: "blue",
    engine: "Interactive HTML/SVG",
    topic: "Tree Balancing Invariants",
    desc: "Restores height-balance factor |h_L - h_R| <= 1 in O(1) pointer updates upon insertion.",
    previewType: "tree"
  },
  {
    id: "matrix-transform",
    title: "Matrix Multiplication: 2D Linear Basis Vector Transformation",
    trackId: "math221",
    trackCode: "MATH221",
    trackType: "course",
    trackTag: "green",
    engine: "Interactive HTML/SVG",
    topic: "Coordinate Transformation & Inner Products",
    desc: "Interactive coordinate grid showing how matrix columns warp standard unit basis vectors i-hat and j-hat.",
    previewType: "matrix"
  },
  {
    id: "eigen-transform",
    title: "Eigenvalues & Invariant Subspace Transformation",
    trackId: "math221",
    trackCode: "MATH221",
    trackType: "course",
    trackTag: "green",
    engine: "3Blue1Brown Manim",
    topic: "Linear Algebra & Coordinate Systems",
    desc: "Visualizes the coordinate stretch where A·v = λ·v, maintaining directional collinearity.",
    previewType: "matrix"
  },
  {
    id: "aws-alb-balancer",
    title: "AWS Elastic Load Balancer: Layer 7 Request Router & Target Groups",
    trackId: "aws_ccp",
    trackCode: "AWS CCP",
    trackType: "credential",
    trackTag: "purple",
    engine: "Interactive HTML/SVG",
    topic: "Cloud High Availability & Fault Tolerance",
    desc: "Interactive traffic distributor simulating round-robin and least-outstanding requests across Multi-AZ targets.",
    previewType: "cloud"
  },
  {
    id: "econ-elasticity",
    title: "Microeconomics: Supply, Demand & Price Elasticity Equilibrium",
    trackId: "econ102",
    trackCode: "ECON102",
    trackType: "course",
    trackTag: "orange",
    engine: "Interactive HTML/SVG",
    topic: "Equilibrium & Deadweight Loss",
    desc: "Calculates price elasticity of demand coefficient and tax wedge deadweight loss shifts.",
    previewType: "chart"
  },
  {
    id: "sci-kinematics",
    title: "Kinematics & Harmonic Oscillator: Phase Space Orbits",
    trackId: "sci101",
    trackCode: "SCI101",
    trackType: "course",
    trackTag: "green",
    engine: "Interactive HTML/SVG",
    topic: "Classical Mechanics & Energy Conservation",
    desc: "Interactive conservation of mechanical energy visualization for spring-mass potential and kinetic energy trades.",
    previewType: "graph"
  },
  {
    id: "git-rebase",
    title: "Git Workflows: Interactive Rebase vs Merge Fast-Forward",
    trackId: "git_skill",
    trackCode: "Git Workflows",
    trackType: "skill",
    trackTag: "purple",
    engine: "Interactive HTML/SVG",
    topic: "Version Control & Branching Invariants",
    desc: "Simulates commit DAG transformations, cherry-picks, and linear git history flattening.",
    previewType: "tree"
  }
];
