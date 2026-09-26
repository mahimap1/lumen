export const INITIAL_COURSES = {
  cmsc341: {
    id: "cmsc341",
    icon: "📘",
    code: "CMSC 341",
    title: "CMSC 341: Data Structures",
    desc: "Tree balancing, asymptotic complexity, graph traversal, and memory hierarchies.",
    tagClass: "blue",
    instructor: "Prof. Dixon • Mon/Wed 1:00 PM",
    todos: [
      { id: "t1", text: "Implement Left-Right Double Rotation in C++", meta: "Due Sep 27 • High Priority", done: false },
      { id: "t2", text: "Memory leak check with Valgrind on Red-Black deletion", meta: "Verification step", done: false }
    ],
    deadlines: [
      { id: "d1", title: "Project 2: Self-Balancing AVL Trees", sub: "Git Autograder", due: "In 18 hrs", color: "var(--tag-red-text)", date: "Sep 27, 11:45 AM" },
      { id: "d2", title: "Homework 4: Graph BFS/DFS Complexity", sub: "Written Proof", due: "In 7 days", color: "var(--tag-orange-text)", date: "Oct 04, 11:59 PM" }
    ],
    notes: [
      {
        id: "avl-rotation",
        date: "Sep 24, 2026",
        title: "AVL Tree Balancing & Rotations",
        topic: "Self-Balancing Invariants // O(log N)",
        visual: "1 Visual",
        content: `# AVL Tree Balancing & Rotations
Date: September 24, 2026
Course: CMSC 341

An AVL tree (named after Adelson-Velsky and Landis) is a self-balancing binary search tree. In an AVL tree, the heights of the two child subtrees of any node differ by at most one:

BalanceFactor(node) = Height(node.left) - Height(node.right) ∈ {-1, 0, +1}

If at any point during an insertion or deletion the balance factor becomes +2 or -2, a rotation is performed immediately to restore the invariant in O(1) time.

## The Four Rotation Cases
- Left-Left (LL): Solved with a single Right Rotation.
- Right-Right (RR): Solved with a single Left Rotation.
- Left-Right (LR): Solved with a Left Rotation on child, then Right Rotation on parent.
- Right-Left (RL): Solved with a Right Rotation on child, then Left Rotation on parent.`
      },
      {
        id: "graph-traversal",
        date: "Sep 21, 2026",
        title: "Graph Traversal: BFS vs DFS",
        topic: "Queue vs Recursion Stack Invariants",
        visual: "2 Visuals",
        content: `# Graph Traversal: BFS vs DFS Frontiers
Date: September 21, 2026
Course: CMSC 341

Breadth-First Search (BFS) explores all neighbors at current depth before moving deeper, using a FIFO Queue. It guarantees the shortest path in unweighted graphs.

Depth-First Search (DFS) dives down a branch until a leaf is hit, using a LIFO Stack / Recursion. Ideal for cycle detection and topological sorting in DAGs.`
      },
      {
        id: "hash-collision",
        date: "Sep 15, 2026",
        title: "Hash Tables & Quadratic Probing",
        topic: "Load Factor α < 0.5 & Clustering",
        visual: "1 Visual",
        content: `# Hash Tables & Collision Resolution
Date: September 15, 2026
Course: CMSC 341

When two keys hash to the same bucket, open addressing resolves collisions by probing alternative indices. Quadratic probing computes hash(k) + i^2 to eliminate primary clustering.`
      }
    ]
  },
  math221: {
    id: "math221",
    icon: "📐",
    code: "MATH 221",
    title: "MATH 221: Linear Algebra",
    desc: "Vector spaces, subspaces, linear independence, eigenvalues, and symmetric matrix diagonalization.",
    tagClass: "green",
    instructor: "Prof. Patel • Tue/Thu 10:00 AM",
    todos: [
      { id: "t3", text: "Gram-Schmidt Orthogonalization calculations for Problem Set 4", meta: "Due Sep 28", done: false },
      { id: "t4", text: "Calculate characteristic polynomial roots", meta: "Practice problem 12", done: false }
    ],
    deadlines: [
      { id: "d3", title: "Problem Set 5: Vector Subspaces", sub: "PDF Upload", due: "In 2 days", color: "var(--tag-orange-text)", date: "Sep 28, 11:59 PM" }
    ],
    notes: [
      {
        id: "eigenvalues",
        date: "Sep 22, 2026",
        title: "Eigenvectors & Coordinate Transformations",
        topic: "A v = λ v Invariant Subspaces",
        visual: "1 Visual",
        content: `# Eigenvectors & Diagonalization
Eigenvalues λ satisfy det(A - λI) = 0. When a matrix operates on an eigenvector, the vector does not rotate; it only scales by factor λ.`
      }
    ]
  },
  entr201: {
    id: "entr201",
    icon: "💡",
    code: "ENTR 201",
    title: "ENTR 201: Tech Venture Studio",
    desc: "Startup customer discovery, CAC vs LTV economics, and investor pitch synthesis.",
    tagClass: "orange",
    instructor: "Adjunct Prof. Marcus • Fri 2:00 PM",
    todos: [
      { id: "t5", text: "Refine Pitch Slide: Visual Retention Advantage", meta: "Due Sep 29", done: false }
    ],
    deadlines: [
      { id: "d4", title: "HackUMBC Demo Pitch Deck & Submission", sub: "Devpost Portal", due: "In 3 days", color: "var(--tag-orange-text)", date: "Sep 29, 5:00 PM" }
    ],
    notes: [
      {
        id: "unit-economics",
        date: "Sep 18, 2026",
        title: "SaaS Financial Metrics & Unit Economics",
        topic: "LTV/CAC > 3x & Payback Horizon",
        visual: "1 Visual",
        content: `# SaaS Unit Economics
LTV/CAC ratio must exceed 3.0x for sustainable growth. Payback period on customer acquisition costs should be under 12 months.`
      }
    ]
  },
  cmsc471: {
    id: "cmsc471",
    icon: "🤖",
    code: "CMSC 471",
    title: "CMSC 471: Intro to AI & Machine Learning",
    desc: "Heuristic search, neural representations, Markov decision processes, and reinforcement learning.",
    tagClass: "purple",
    instructor: "Prof. Oates • Mon/Wed 4:00 PM",
    todos: [
      { id: "t6", text: "Verify Admissibility Condition on Graph Heuristics", meta: "Homework 3", done: true }
    ],
    deadlines: [
      { id: "d5", title: "Lab 3: A* Pathfinding Simulation", sub: "Python Notebook", due: "In 6 days", color: "var(--text-secondary)", date: "Oct 02, 11:59 PM" }
    ],
    notes: [
      {
        id: "heuristics",
        date: "Sep 20, 2026",
        title: "Informed Search: A* & Admissible Heuristics",
        topic: "Monotonicity & Consistency",
        visual: "2 Visuals",
        content: `# A* Informed Search & Heuristics
An admissible heuristic never overestimates the true cost: h(n) <= h*(n). Consistency further guarantees that f(n) values are monotonically non-decreasing along paths.`
      }
    ]
  }
};
