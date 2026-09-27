// mlWidgets.js - High-quality standalone interactive HTML/CSS/JS visualizations
// Curated specifically for Aspiring Machine Learning Engineers across CMSC 313, CMSC 341, MATH 221, and AWS CCP.

export const ML_WIDGETS = [
  // ==========================================
  // CMSC 313: Low-Level Hardware & Systems for ML
  // ==========================================
  {
    id: "cmsc313-simd-tensor",
    title: "CMSC 313: AVX-512 SIMD Vectorization vs Scalar GEMM",
    trackId: "cmsc313",
    trackCode: "CMSC 313",
    trackType: "course",
    trackTag: "blue",
    engine: "Interactive HTML/CSS/JS",
    topic: "Hardware Vectorization & Parallel Tensor Ops",
    desc: "How 512-bit vector registers accelerate FP32 dot products and transformer feed-forward passes by 16x over sequential scalar execution.",
    previewType: "simd",
    previewSnippet: "[16x FP32 FMA] ⚡ AVX-512 Matrix Vector Engine",
    html: `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace; }
  body { background: #0c0d12; color: #e2e8f0; padding: 18px; }
  .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 12px; margin-bottom: 16px; }
  .badge { background: #3b82f620; color: #60a5fa; border: 1px solid #3b82f640; padding: 3px 8px; border-radius: 999px; font-size: 11px; font-weight: 600; }
  .title { font-size: 15px; font-weight: 700; color: #f8fafc; }
  .desc { font-size: 12px; color: #94a3b8; margin-top: 4px; line-height: 1.4; }
  .arena { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 14px; }
  .card { background: #131722; border: 1px solid #1e293b; border-radius: 8px; padding: 14px; }
  .card-header { font-size: 12.5px; font-weight: 600; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; }
  .vec-lane { display: flex; gap: 4px; margin: 6px 0; overflow-x: auto; padding-bottom: 4px; }
  .lane-box { flex: 1; min-width: 24px; height: 32px; background: #1e293b; border: 1px solid #334155; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 10.5px; font-weight: 600; color: #cbd5e1; transition: all 0.2s; }
  .lane-box.active { background: #3b82f6; border-color: #60a5fa; color: #fff; transform: scale(1.05); box-shadow: 0 0 10px #3b82f660; }
  .lane-box.computed { background: #10b981; border-color: #34d399; color: #fff; }
  .metrics { display: flex; gap: 12px; margin-top: 14px; background: #090b10; padding: 10px 14px; border-radius: 6px; border: 1px solid #1e293b; }
  .metric-item { flex: 1; }
  .metric-label { font-size: 10.5px; color: #64748b; text-transform: uppercase; }
  .metric-val { font-size: 16px; font-weight: 700; color: #38bdf8; font-family: monospace; }
  .controls { display: flex; gap: 8px; margin-top: 16px; }
  button { background: #2563eb; color: #fff; border: none; border-radius: 6px; padding: 8px 14px; font-size: 12px; font-weight: 600; cursor: pointer; transition: background 0.15s; }
  button:hover { background: #1d4ed8; }
  button.sec { background: #1e293b; color: #cbd5e1; }
  button.sec:hover { background: #334155; }
  .callout { margin-top: 14px; font-size: 11.5px; background: #181d2c; border-left: 3px solid #60a5fa; padding: 8px 12px; border-radius: 0 6px 6px 0; color: #cbd5e1; }
</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="title">AVX-512 Vectorization: Accelerating Neural Net GEMM</div>
      <div class="desc">CMSC 313 Hardware Invariant ➔ Machine Learning Inference Throughput</div>
    </div>
    <div class="badge">Hardware Accelerator</div>
  </div>

  <div class="arena">
    <!-- Scalar Execution -->
    <div class="card">
      <div class="card-header" style="color: #f87171;">
        <span>Sequential Scalar ALU (1 FP32/cycle)</span>
        <span id="scalar-status" style="font-size: 11px; color: #94a3b8;">Cycles: 0 / 16</span>
      </div>
      <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">Weight Vector w[0..15]</div>
      <div class="vec-lane" id="scalar-lanes-w"></div>
      <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">Activation Vector x[0..15]</div>
      <div class="vec-lane" id="scalar-lanes-x"></div>
      <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">Accumulator Output</div>
      <div style="font-family: monospace; font-size: 12px; color: #f87171;" id="scalar-acc">Acc = 0.00</div>
    </div>

    <!-- AVX-512 SIMD -->
    <div class="card">
      <div class="card-header" style="color: #38bdf8;">
        <span>AVX-512 SIMD FMA (16 FP32s in 1 Cycle)</span>
        <span id="simd-status" style="font-size: 11px; color: #94a3b8;">Cycles: 0 / 1</span>
      </div>
      <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">zmm0 Register (16 parallel FP32 lanes)</div>
      <div class="vec-lane" id="simd-lanes-w"></div>
      <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">zmm1 Register (16 parallel FP32 lanes)</div>
      <div class="vec-lane" id="simd-lanes-x"></div>
      <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">Vector Fused Multiply-Add (vfmadd231ps)</div>
      <div style="font-family: monospace; font-size: 12px; color: #34d399;" id="simd-acc">zmm2 = zmm0 ⊗ zmm1 + zmm2</div>
    </div>
  </div>

  <div class="metrics">
    <div class="metric-item">
      <div class="metric-label">Scalar Latency</div>
      <div class="metric-val" id="metric-scalar" style="color:#f87171">16.0 ns</div>
    </div>
    <div class="metric-item">
      <div class="metric-label">AVX-512 Latency</div>
      <div class="metric-val" id="metric-simd" style="color:#34d399">1.0 ns</div>
    </div>
    <div class="metric-item">
      <div class="metric-label">Compute Speedup</div>
      <div class="metric-val" id="metric-speedup" style="color:#60a5fa">16.0x</div>
    </div>
    <div class="metric-item">
      <div class="metric-label">Roofline Bound</div>
      <div class="metric-val" style="color:#e2e8f0">Compute-Bound</div>
    </div>
  </div>

  <div class="controls">
    <button onclick="runStep()">▶ Step Clock Cycle</button>
    <button onclick="runAll()">⚡ Full Execution Burst</button>
    <button class="sec" onclick="resetSim()">↺ Reset Hardware State</button>
  </div>

  <div class="callout">
    💡 <strong>Why this matters to an ML Engineer:</strong> Deep learning libraries (PyTorch, TensorFlow, ONNX Runtime) depend on BLAS engines (Intel oneMKL, OpenBLAS) that unpack weights directly into SIMD <code>zmm</code> vector registers. Matrix multiplication (GEMM) speed determines real-time inference latency and memory throughput.
  </div>

  <script>
    let step = 0;
    const N = 16;
    const weights = [0.4, -1.2, 0.8, 0.5, -0.3, 0.9, -0.7, 0.2, 1.1, -0.4, 0.6, 0.3, -0.8, 0.5, 0.1, -0.9];
    const inputs =  [1.0,  0.5, 2.0, 1.5,  0.0, 1.2,  0.8, 0.4, 0.5,  1.8, 0.2, 0.9,  1.1, 0.6, 2.5,  0.7];

    function initUI() {
      const sw = document.getElementById('scalar-lanes-w');
      const sx = document.getElementById('scalar-lanes-x');
      const mw = document.getElementById('simd-lanes-w');
      const mx = document.getElementById('simd-lanes-x');
      sw.innerHTML = ''; sx.innerHTML = ''; mw.innerHTML = ''; mx.innerHTML = '';

      for(let i=0; i<N; i++) {
        sw.innerHTML += '<div class="lane-box" id="sw-'+i+'">'+weights[i].toFixed(1)+'</div>';
        sx.innerHTML += '<div class="lane-box" id="sx-'+i+'">'+inputs[i].toFixed(1)+'</div>';
        mw.innerHTML += '<div class="lane-box" id="mw-'+i+'">'+weights[i].toFixed(1)+'</div>';
        mx.innerHTML += '<div class="lane-box" id="mx-'+i+'">'+inputs[i].toFixed(1)+'</div>';
      }
    }

    function renderState() {
      for(let i=0; i<N; i++) {
        const sw = document.getElementById('sw-'+i);
        const sx = document.getElementById('sx-'+i);
        sw.className = 'lane-box' + (i < step ? ' computed' : (i === step ? ' active' : ''));
        sx.className = 'lane-box' + (i < step ? ' computed' : (i === step ? ' active' : ''));
      }
      
      let scalarSum = 0;
      for(let i=0; i<Math.min(step, N); i++) scalarSum += weights[i] * inputs[i];
      document.getElementById('scalar-acc').innerText = 'Acc = ' + scalarSum.toFixed(3) + ' (Step ' + Math.min(step, N) + '/16)';
      document.getElementById('scalar-status').innerText = 'Cycles: ' + Math.min(step, N) + ' / 16';

      const simdDone = step >= 1;
      for(let i=0; i<N; i++) {
        document.getElementById('mw-'+i).className = 'lane-box' + (simdDone ? ' computed' : ' active');
        document.getElementById('mx-'+i).className = 'lane-box' + (simdDone ? ' computed' : ' active');
      }
      document.getElementById('simd-status').innerText = 'Cycles: ' + (simdDone ? 1 : 0) + ' / 1';
      let totalDot = 0;
      for(let i=0; i<N; i++) totalDot += weights[i] * inputs[i];
      if (simdDone) {
        document.getElementById('simd-acc').innerText = 'zmm2 Result = ' + totalDot.toFixed(3) + ' (16 lanes fused in 1 cycle)';
      }
    }

    function runStep() {
      if (step < N) step++;
      renderState();
    }

    function runAll() {
      step = N;
      renderState();
    }

    function resetSim() {
      step = 0;
      initUI();
      renderState();
    }

    initUI();
    renderState();
  </script>
</body>
</html>`
  },
  {
    id: "cmsc313-gpu-cuda-memory",
    title: "CMSC 313: GPU Memory Hierarchy & CUDA Coalesced Memory Access",
    trackId: "cmsc313",
    trackCode: "CMSC 313",
    trackType: "course",
    trackTag: "blue",
    engine: "Interactive HTML/CSS/JS",
    topic: "Computer Architecture & Tensor Memory Bandwidth",
    desc: "Demonstrates memory coalescing across warp threads (32 threads per warp) hitting HBM/SRAM vs strided uncoalesced memory stalls in PyTorch custom CUDA kernels.",
    previewType: "cuda",
    previewSnippet: "32-Thread Warp ⇄ Coalesced 128B Transaction Cache Line",
    html: `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace; }
  body { background: #0b0f19; color: #f1f5f9; padding: 18px; }
  .head { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 10px; margin-bottom: 14px; }
  .badge { background: #8b5cf620; color: #a78bfa; border: 1px solid #8b5cf640; padding: 3px 8px; border-radius: 999px; font-size: 11px; }
  .mode-toggle { display: flex; gap: 8px; margin-bottom: 14px; }
  button { background: #1e293b; border: 1px solid #334155; color: #cbd5e1; padding: 6px 12px; border-radius: 6px; font-size: 11.5px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  button.active { background: #6366f1; border-color: #818cf8; color: #fff; }
  .container { background: #111827; border: 1px solid #1f2937; border-radius: 8px; padding: 16px; margin-bottom: 14px; }
  .row-title { font-size: 11.5px; color: #94a3b8; margin-bottom: 6px; text-transform: uppercase; font-weight: 600; }
  .threads-grid { display: grid; grid-template-columns: repeat(16, 1fr); gap: 4px; margin-bottom: 14px; }
  .thread-cell { height: 28px; background: #1e293b; border: 1px solid #334155; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; color: #93c5fd; }
  .mem-grid { display: grid; grid-template-columns: repeat(16, 1fr); gap: 4px; margin-bottom: 8px; }
  .mem-cell { height: 32px; background: #0f172a; border: 1px solid #334155; border-radius: 4px; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 9.5px; color: #64748b; transition: all 0.2s; }
  .mem-cell.hit { background: #10b98130; border-color: #10b981; color: #34d399; font-weight: bold; }
  .mem-cell.miss { background: #ef444430; border-color: #ef4444; color: #f87171; }
  .stats-bar { display: flex; gap: 14px; background: #030712; padding: 12px; border-radius: 6px; border: 1px solid #1f2937; }
  .stat { flex: 1; }
  .stat-label { font-size: 10.5px; color: #64748b; }
  .stat-val { font-size: 16px; font-weight: 700; color: #38bdf8; font-family: monospace; }
  .insight { margin-top: 12px; font-size: 11.5px; background: #1e1b4b; border-left: 3px solid #818cf8; padding: 8px 12px; border-radius: 0 6px 6px 0; color: #c7d2fe; }
</style>
</head>
<body>
  <div class="head">
    <div>
      <div style="font-size: 15px; font-weight: 700; color: #fff;">CUDA Memory Coalescing & HBM Bandwidth</div>
      <div style="font-size: 11.5px; color: #94a3b8;">GPU Architecture Invariant for High-Throughput Matrix Multiplications</div>
    </div>
    <div class="badge">NVIDIA Hopper/Blackwell Architecture</div>
  </div>

  <div class="mode-toggle">
    <button id="btn-coalesced" class="active" onclick="setMode('coalesced')">✓ Coalesced Access (Stride = 1)</button>
    <button id="btn-strided" onclick="setMode('strided')">✗ Uncoalesced Strided Access (Stride = 8)</button>
  </div>

  <div class="container">
    <div class="row-title">Active Warp Threads (ThreadIdx.x 0..15)</div>
    <div class="threads-grid" id="threads-grid"></div>

    <div class="row-title">Global VRAM / HBM3 Memory Bus (128-Byte Cache Segments)</div>
    <div class="mem-grid" id="mem-grid"></div>
  </div>

  <div class="stats-bar">
    <div class="stat">
      <div class="stat-label">Memory Transactions</div>
      <div class="stat-val" id="val-transactions">1 Cache Line (128B)</div>
    </div>
    <div class="stat">
      <div class="stat-label">Bus Efficiency</div>
      <div class="stat-val" id="val-efficiency" style="color: #34d399;">100% (High Saturation)</div>
    </div>
    <div class="stat">
      <div class="stat-label">Warp Stalls</div>
      <div class="stat-val" id="val-stalls" style="color: #34d399;">0 Cycles</div>
    </div>
    <div class="stat">
      <div class="stat-label">Bandwidth Delivered</div>
      <div class="stat-val" id="val-bw">3.2 TB/s</div>
    </div>
  </div>

  <div class="insight" id="insight-text">
    💡 <strong>ML Engineering Impact:</strong> When consecutive threads access consecutive memory addresses, the memory controller merges 16 reads into a single 128B bus burst. In transformer attention (FlashAttention), avoiding uncoalesced memory reads is what yields 4-8x faster training.
  </div>

  <script>
    function setMode(mode) {
      document.getElementById('btn-coalesced').className = mode === 'coalesced' ? 'active' : '';
      document.getElementById('btn-strided').className = mode === 'strided' ? 'active' : '';
      
      const tg = document.getElementById('threads-grid');
      const mg = document.getElementById('mem-grid');
      tg.innerHTML = ''; mg.innerHTML = '';

      for(let i=0; i<16; i++) {
        tg.innerHTML += '<div class="thread-cell">T' + i + '</div>';
      }

      for(let i=0; i<16; i++) {
        if (mode === 'coalesced') {
          mg.innerHTML += '<div class="mem-cell hit"><span>Idx ' + i + '</span><span style="font-size:8px;">[Hit]</span></div>';
        } else {
          const isHit = i % 4 === 0;
          mg.innerHTML += '<div class="mem-cell ' + (isHit ? 'miss' : '') + '"><span>Idx ' + (i*4) + '</span><span style="font-size:8px;">' + (isHit ? '[Split]' : '[Idle]') + '</span></div>';
        }
      }

      if (mode === 'coalesced') {
        document.getElementById('val-transactions').innerText = '1 Cache Line (128B)';
        document.getElementById('val-efficiency').innerText = '100% (High Saturation)';
        document.getElementById('val-efficiency').style.color = '#34d399';
        document.getElementById('val-stalls').innerText = '0 Cycles';
        document.getElementById('val-stalls').style.color = '#34d399';
        document.getElementById('val-bw').innerText = '3.2 TB/s';
        document.getElementById('insight-text').innerHTML = '💡 <strong>ML Engineering Impact:</strong> 100% bus utilization. Consecutive CUDA threads read adjacent tensor elements in 1 memory transaction.';
      } else {
        document.getElementById('val-transactions').innerText = '8 Cache Lines (1024B)';
        document.getElementById('val-efficiency').innerText = '12.5% (High Waste)';
        document.getElementById('val-efficiency').style.color = '#f87171';
        document.getElementById('val-stalls').innerText = '320 Cycles (DRAM Latency)';
        document.getElementById('val-stalls').style.color = '#f87171';
        document.getElementById('val-bw').innerText = '0.4 TB/s';
        document.getElementById('insight-text').innerHTML = '⚠️ <strong>Memory Bottleneck:</strong> Strided access forces the GPU to issue 8 separate memory fetches for the same data. The GPU warp stalls waiting on memory, dropping GPU compute utilization to under 15%.';
      }
    }
    setMode('coalesced');
  </script>
</body>
</html>`
  },

  // ==========================================
  // CMSC 341: Data Structures & Algorithms for ML
  // ==========================================
  {
    id: "cmsc341-ann-vector-index",
    title: "CMSC 341: HNSW Graph vs KD-Tree Vector Search (RAG & Embeddings)",
    trackId: "cmsc341",
    trackCode: "CMSC 341",
    trackType: "course",
    trackTag: "blue",
    engine: "Interactive HTML/CSS/JS",
    topic: "High-Dimensional Spatial Search & Graph Traversal",
    desc: "Visualizes why classical KD-Trees degrade to O(N) due to the Curse of Dimensionality (d > 20) and how Hierarchical Navigable Small World (HNSW) graphs achieve O(log N) vector similarity for LLMs.",
    previewType: "graph",
    previewSnippet: "HNSW Multi-Layer Skip-Graph ⇄ O(log N) Cosine Search",
    html: `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace; }
  body { background: #0c0e14; color: #f8fafc; padding: 16px; }
  .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 10px; margin-bottom: 12px; }
  .title { font-size: 14.5px; font-weight: 700; color: #38bdf8; }
  .canvas-container { position: relative; width: 100%; height: 260px; background: #06080d; border: 1px solid #1e293b; border-radius: 8px; overflow: hidden; }
  canvas { width: 100%; height: 100%; display: block; }
  .controls { display: flex; gap: 8px; margin-top: 12px; align-items: center; }
  button { background: #1e293b; border: 1px solid #334155; color: #cbd5e1; padding: 6px 12px; border-radius: 6px; font-size: 11.5px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  button.active { background: #0284c7; border-color: #38bdf8; color: #fff; }
  .metrics { display: flex; gap: 12px; margin-top: 12px; background: #111827; padding: 10px 14px; border-radius: 6px; border: 1px solid #1f2937; }
  .metric { flex: 1; }
  .metric-label { font-size: 10px; color: #64748b; text-transform: uppercase; }
  .metric-val { font-size: 15px; font-weight: 700; color: #38bdf8; font-family: monospace; }
  .tip { margin-top: 10px; font-size: 11.5px; background: #0f172a; border-left: 3px solid #38bdf8; padding: 8px 12px; border-radius: 0 6px 6px 0; color: #94a3b8; }
</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="title">Vector Indexing: HNSW Graph Search for Embedding Retrieval</div>
      <div style="font-size: 11.5px; color: #94a3b8;">CMSC 341 Graph Invariants ➔ Milvus, Pinecone, FAISS Vector Search</div>
    </div>
    <span style="background: #0284c720; color: #38bdf8; border: 1px solid #0284c740; padding: 2px 8px; border-radius: 999px; font-size: 10.5px;">d = 1536 (OpenAI Embeddings)</span>
  </div>

  <div class="canvas-container">
    <canvas id="graphCanvas"></canvas>
  </div>

  <div class="controls">
    <button id="btn-hnsw" class="active" onclick="switchMode('hnsw')">⚡ HNSW Small-World Graph (O(log N))</button>
    <button id="btn-brute" onclick="switchMode('brute')">🐢 Brute-Force KNN Scan (O(N·d))</button>
    <button onclick="queryNewVector()">🎯 Query New Embedding Vector</button>
  </div>

  <div class="metrics">
    <div class="metric">
      <div class="metric-label">Vectors Visited</div>
      <div class="metric-val" id="metric-hops" style="color: #34d399;">5 nodes (Greedy Hops)</div>
    </div>
    <div class="metric">
      <div class="metric-label">Similarity Metric</div>
      <div class="metric-val">Cosine Similarity > 0.89</div>
    </div>
    <div class="metric">
      <div class="metric-label">Index Latency</div>
      <div class="metric-val" id="metric-latency" style="color: #38bdf8;">1.4 ms</div>
    </div>
    <div class="metric">
      <div class="metric-label">Recall@10</div>
      <div class="metric-val" style="color: #a78bfa;">98.4%</div>
    </div>
  </div>

  <div class="tip">
    💡 <strong>ML System Design:</strong> Classical KD-trees fail in ML because high-dimensional spaces suffer the "curse of dimensionality" (almost all vectors are equidistant). CMSC 341 graph theory (Dijkstra, greedy best-first search, and skip-lists) powers HNSW, which is the foundational algorithm inside vector databases for Retrieval-Augmented Generation (RAG).
  </div>

  <script>
    const canvas = document.getElementById('graphCanvas');
    const ctx = canvas.getContext('2d');
    let width, height;

    function resize() {
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
      draw();
    }
    window.addEventListener('resize', resize);

    const nodes = [];
    const N = 35;
    for(let i=0; i<N; i++) {
      nodes.push({
        x: Math.random() * 0.85 + 0.07,
        y: Math.random() * 0.75 + 0.12,
        neighbors: []
      });
    }

    // Build Delaunay/HNSW proximity edges
    for(let i=0; i<N; i++) {
      const dists = [];
      for(let j=0; j<N; j++) {
        if (i !== j) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          dists.push({ id: j, d: dx*dx + dy*dy });
        }
      }
      dists.sort((a,b) => a.d - b.d);
      nodes[i].neighbors = dists.slice(0, 3).map(x => x.id);
    }

    let query = { x: 0.8, y: 0.7 };
    let path = [];
    let mode = 'hnsw';

    function findHNSWPath() {
      let curr = 0; // Entry point
      path = [curr];
      let bestDist = Math.hypot(nodes[curr].x - query.x, nodes[curr].y - query.y);

      for(let step=0; step<10; step++) {
        let changed = false;
        for(let n of nodes[curr].neighbors) {
          const d = Math.hypot(nodes[n].x - query.x, nodes[n].y - query.y);
          if (d < bestDist) {
            bestDist = d;
            curr = n;
            path.push(curr);
            changed = true;
            break;
          }
        }
        if (!changed) break;
      }
    }

    function switchMode(m) {
      mode = m;
      document.getElementById('btn-hnsw').className = m === 'hnsw' ? 'active' : '';
      document.getElementById('btn-brute').className = m === 'brute' ? 'active' : '';
      if (m === 'hnsw') {
        findHNSWPath();
        document.getElementById('metric-hops').innerText = path.length + ' nodes (Greedy Hops)';
        document.getElementById('metric-hops').style.color = '#34d399';
        document.getElementById('metric-latency').innerText = '1.4 ms';
      } else {
        path = nodes.map((_, i) => i);
        document.getElementById('metric-hops').innerText = N + ' nodes (Full Exhaustive Scan)';
        document.getElementById('metric-hops').style.color = '#f87171';
        document.getElementById('metric-latency').innerText = '38.2 ms';
      }
      draw();
    }

    function queryNewVector() {
      query = { x: Math.random() * 0.75 + 0.12, y: Math.random() * 0.65 + 0.15 };
      if (mode === 'hnsw') findHNSWPath();
      draw();
    }

    function draw() {
      if (!width || !height) return;
      ctx.clearRect(0, 0, width, height);

      // Draw all graph edges
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for(let i=0; i<N; i++) {
        for(let n of nodes[i].neighbors) {
          ctx.beginPath();
          ctx.moveTo(nodes[i].x * width, nodes[i].y * height);
          ctx.lineTo(nodes[n].x * width, nodes[n].y * height);
          ctx.stroke();
        }
      }

      // Draw traversed path
      if (mode === 'hnsw' && path.length > 1) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for(let i=0; i<path.length; i++) {
          const pt = nodes[path[i]];
          if (i === 0) ctx.moveTo(pt.x * width, pt.y * height);
          else ctx.lineTo(pt.x * width, pt.y * height);
        }
        ctx.stroke();
      }

      // Draw nodes
      for(let i=0; i<N; i++) {
        const pt = nodes[i];
        const inPath = path.includes(i);
        ctx.beginPath();
        ctx.arc(pt.x * width, pt.y * height, inPath ? 5 : 3.5, 0, Math.PI * 2);
        ctx.fillStyle = inPath ? '#38bdf8' : '#334155';
        ctx.fill();
        ctx.strokeStyle = inPath ? '#bae6fd' : '#0c0e14';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Draw target query vector
      ctx.beginPath();
      ctx.arc(query.x * width, query.y * height, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#f43f5e';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label query vector
      ctx.font = '10px monospace';
      ctx.fillStyle = '#f43f5e';
      ctx.fillText('Target Query Embedding', query.x * width + 10, query.y * height + 3);
    }

    setTimeout(() => { resize(); findHNSWPath(); draw(); }, 50);
  </script>
</body>
</html>`
  },
  {
    id: "cmsc341-trie-bpe-tokenizer",
    title: "CMSC 341: Trie & Byte-Pair Encoding (BPE) LLM Tokenizer",
    trackId: "cmsc341",
    trackCode: "CMSC 341",
    trackType: "course",
    trackTag: "blue",
    engine: "Interactive HTML/CSS/JS",
    topic: "Trie Prefixes & Subword Tokenization Invariants",
    desc: "How LLM tokenizers (tiktoken, LLaMA tokenizer) construct vocabulary Tries and merge frequent subword character pairs in O(log V) time.",
    previewType: "tree",
    previewSnippet: "Prefix Trie ➔ Greedy BPE Subword Merge Pipeline",
    html: `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace; }
  body { background: #0f1117; color: #f8fafc; padding: 16px; }
  .head { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 10px; margin-bottom: 14px; }
  .input-box { width: 100%; background: #1a202c; border: 1px solid #2d3748; padding: 8px 12px; border-radius: 6px; color: #fff; font-size: 13px; margin-bottom: 12px; outline: none; }
  .input-box:focus { border-color: #6366f1; }
  .token-stream { display: flex; flex-wrap: wrap; gap: 6px; margin: 12px 0; min-height: 48px; background: #090d16; padding: 12px; border-radius: 6px; border: 1px solid #1e293b; }
  .token-pill { padding: 4px 10px; border-radius: 4px; font-family: monospace; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; border: 1px solid rgba(255,255,255,0.1); }
  .token-id { font-size: 9.5px; opacity: 0.7; }
  .trie-visual { background: #131826; border: 1px solid #1e293b; border-radius: 6px; padding: 14px; margin-top: 14px; }
  .stats-row { display: flex; gap: 12px; margin-top: 12px; }
  .stat-card { flex: 1; background: #111827; padding: 10px; border-radius: 6px; border: 1px solid #1f2937; }
  .stat-label { font-size: 10px; color: #64748b; text-transform: uppercase; }
  .stat-val { font-size: 15px; font-weight: 700; color: #818cf8; font-family: monospace; }
</style>
</head>
<body>
  <div class="head">
    <div>
      <div style="font-size: 15px; font-weight: 700; color: #818cf8;">BPE Subword Tokenizer & Prefix Trie</div>
      <div style="font-size: 11.5px; color: #94a3b8;">CMSC 341 Trie Search Trees ➔ GPT-4 / LLaMA Tokenization</div>
    </div>
    <span style="background: #6366f120; color: #a5b4fc; border: 1px solid #6366f140; padding: 2px 8px; border-radius: 999px; font-size: 10.5px;">Vocab Size: 32,768</span>
  </div>

  <input type="text" id="prompt-input" class="input-box" value="Machine learning engineers optimize transformer models." oninput="tokenize()"/>

  <div style="font-size: 11.5px; color: #94a3b8; margin-bottom: 4px;">Tokenized Output Array (Vocab IDs mapped via Trie):</div>
  <div class="token-stream" id="token-stream"></div>

  <div class="stats-row">
    <div class="stat-card">
      <div class="stat-label">Characters</div>
      <div class="stat-val" id="stat-chars">54</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Tokens Produced</div>
      <div class="stat-val" id="stat-tokens">8</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Compression Ratio</div>
      <div class="stat-val" id="stat-ratio" style="color: #34d399;">6.75 chars/tok</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Trie Lookup Cost</div>
      <div class="stat-val" style="color: #38bdf8;">O(length)</div>
    </div>
  </div>

  <div class="trie-visual">
    <div style="font-size: 12px; font-weight: 600; color: #cbd5e1; margin-bottom: 6px;">Trie Invariant in Subword Matching:</div>
    <div style="font-size: 11.5px; color: #94a3b8; line-height: 1.5;">
      The tokenizer maintains a prefix Trie of all learned token merges. When reading characters, it performs a <strong>longest-prefix greedy match</strong>. Substrings like <code>"transform"</code> are merged before individual characters <code>['t','r','a','n','s','f','o','r','m']</code>, saving KV-cache memory and attention compute in transformer context windows.
    </div>
  </div>

  <script>
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#f97316'];
    const mockVocab = {
      "Machine": 1421, "machine": 6844, " learning": 4673, "learning": 7231,
      " engine": 9812, "engine": 3410, "ers": 298, " optimize": 16422,
      " transformer": 12891, " models": 4120, ".": 13, " ": 220
    };

    function tokenize() {
      const text = document.getElementById('prompt-input').value;
      const stream = document.getElementById('token-stream');
      stream.innerHTML = '';

      const words = text.match(/\\w+|[^\\w\\s]|\\s+/g) || [];
      let tokenCount = 0;

      words.forEach((w, i) => {
        if (!w.trim()) return;
        tokenCount++;
        const id = mockVocab[w] || mockVocab[w.toLowerCase()] || (1000 + (w.charCodeAt(0) * 17) % 8000);
        const col = colors[i % colors.length];
        stream.innerHTML += '<div class="token-pill" style="background: ' + col + '20; color: ' + col + '; border-color: ' + col + '40;"><span>' + escapeHtml(w) + '</span><span class="token-id">#' + id + '</span></div>';
      });

      document.getElementById('stat-chars').innerText = text.length;
      document.getElementById('stat-tokens').innerText = tokenCount;
      document.getElementById('stat-ratio').innerText = tokenCount ? (text.length / tokenCount).toFixed(2) + ' chars/tok' : '0';
    }

    function escapeHtml(t) {
      return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    tokenize();
  </script>
</body>
</html>`
  },

  // ==========================================
  // MATH 221: Linear Algebra for ML
  // ==========================================
  {
    id: "math221-svd-lowrank-lora",
    title: "MATH 221: Singular Value Decomposition (SVD) & LoRA Fine-Tuning",
    trackId: "math221",
    trackCode: "MATH 221",
    trackType: "course",
    trackTag: "green",
    engine: "Interactive HTML/CSS/JS",
    topic: "Singular Values, Eigenbasis & Low-Rank Parameter Decomposition",
    desc: "Interactive rank decomposition slider demonstrating how LoRA (Low-Rank Adaptation) decomposes large d×d weight update matrices ΔW into B·A where rank r << d, slashing fine-tuning parameters by 99%.",
    previewType: "matrix",
    previewSnippet: "W + ΔW ➔ W₀ + B(d×r) · A(r×k) [Rank Slider r=1..8]",
    html: `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace; }
  body { background: #0d1117; color: #f0f6fc; padding: 18px; }
  .head { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #21262d; padding-bottom: 10px; margin-bottom: 14px; }
  .slider-box { background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 14px; margin-bottom: 14px; }
  .slider-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
  input[type=range] { width: 100%; accent-color: #10b981; }
  .decomposition { display: flex; align-items: center; justify-content: center; gap: 14px; margin: 18px 0; }
  .matrix-box { display: flex; flex-direction: column; align-items: center; }
  .mat-render { border: 2px solid #30363d; border-radius: 6px; background: #0d1117; display: grid; place-items: center; font-family: monospace; font-size: 11px; font-weight: 700; transition: all 0.2s; }
  .mat-w { width: 110px; height: 110px; border-color: #3b82f6; color: #60a5fa; background: #3b82f610; }
  .mat-b { height: 110px; border-color: #10b981; color: #34d399; background: #10b98110; }
  .mat-a { width: 110px; border-color: #f59e0b; color: #fbbf24; background: #f59e0b10; }
  .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; background: #161b22; padding: 12px; border-radius: 6px; border: 1px solid #30363d; }
  .stat { }
  .stat-l { font-size: 10px; color: #8b949e; text-transform: uppercase; }
  .stat-v { font-size: 15px; font-weight: 700; color: #58a6ff; font-family: monospace; }
  .callout { margin-top: 14px; font-size: 11.5px; background: #064e3b30; border-left: 3px solid #10b981; padding: 8px 12px; border-radius: 0 6px 6px 0; color: #a7f3d0; }
</style>
</head>
<body>
  <div class="head">
    <div>
      <div style="font-size: 15px; font-weight: 700; color: #34d399;">LoRA & SVD: Low-Rank Matrix Decomposition</div>
      <div style="font-size: 11.5px; color: #8b949e;">MATH 221 Rank & Subspaces ➔ Efficient LLM Fine-Tuning</div>
    </div>
    <span style="background: #10b98120; color: #34d399; border: 1px solid #10b98140; padding: 2px 8px; border-radius: 999px; font-size: 10.5px;">W₀ (Frozen) + B · A</span>
  </div>

  <div class="slider-box">
    <div class="slider-row">
      <span style="font-size: 12px; font-weight: 600;">Intrinsic Adapter Rank (r):</span>
      <span id="rank-val" style="font-size: 14px; font-weight: 800; color: #10b981; font-family: monospace;">r = 4</span>
    </div>
    <input type="range" id="rank-slider" min="1" max="16" value="4" oninput="updateRank(this.value)"/>
  </div>

  <div class="decomposition">
    <div class="matrix-box">
      <div style="font-size: 10.5px; color: #8b949e; margin-bottom: 4px;">Full Update ΔW</div>
      <div class="mat-render mat-w">4096 × 4096<br/>(16.7M params)</div>
    </div>
    <div style="font-size: 20px; color: #8b949e;">≈</div>
    <div class="matrix-box">
      <div style="font-size: 10.5px; color: #8b949e; margin-bottom: 4px;">Matrix B (d × r)</div>
      <div class="mat-render mat-b" id="mat-b-box" style="width: 32px;">4096 × 4</div>
    </div>
    <div style="font-size: 16px; color: #8b949e;">×</div>
    <div class="matrix-box">
      <div style="font-size: 10.5px; color: #8b949e; margin-bottom: 4px;">Matrix A (r × d)</div>
      <div class="mat-render mat-a" id="mat-a-box" style="height: 32px;">4 × 4096</div>
    </div>
  </div>

  <div class="stats">
    <div class="stat">
      <div class="stat-l">Full Parameters</div>
      <div class="stat-v" style="color: #f87171;">16,777,216</div>
    </div>
    <div class="stat">
      <div class="stat-l">LoRA Trainable</div>
      <div class="stat-v" id="stat-trainable" style="color: #34d399;">32,768</div>
    </div>
    <div class="stat">
      <div class="stat-l">VRAM Savings</div>
      <div class="stat-v" id="stat-savings" style="color: #38bdf8;">99.80%</div>
    </div>
    <div class="stat">
      <div class="stat-l">Intrinsic Variance</div>
      <div class="stat-v" id="stat-var" style="color: #fbbf24;">94.2% Captured</div>
    </div>
  </div>

  <div class="callout">
    💡 <strong>Linear Algebra Invariant:</strong> The Eckart-Young-Mirsky Theorem proves that the best rank-<code>r</code> approximation of matrix <code>W</code> in Frobenius norm is obtained from its top <code>r</code> singular values and vectors. LoRA applies this exact linear algebra theorem to fine-tune 70B parameter models on a single consumer GPU.
  </div>

  <script>
    function updateRank(r) {
      r = parseInt(r);
      document.getElementById('rank-val').innerText = 'r = ' + r;
      
      const widthB = Math.max(16, Math.min(80, r * 5));
      const heightA = Math.max(16, Math.min(80, r * 5));
      
      const boxB = document.getElementById('mat-b-box');
      const boxA = document.getElementById('mat-a-box');
      boxB.style.width = widthB + 'px';
      boxB.innerText = '4096 × ' + r;
      boxA.style.height = heightA + 'px';
      boxA.innerText = r + ' × 4096';

      const d = 4096;
      const trainable = 2 * d * r;
      const full = d * d;
      const savings = (100 - (trainable / full * 100)).toFixed(2);
      const variance = Math.min(99.6, 75 + Math.sqrt(r) * 6).toFixed(1);

      document.getElementById('stat-trainable').innerText = trainable.toLocaleString();
      document.getElementById('stat-savings').innerText = savings + '%';
      document.getElementById('stat-var').innerText = variance + '% Captured';
    }
  </script>
</body>
</html>`
  },
  {
    id: "math221-gradient-descent-hessian",
    title: "MATH 221: Hessian Curvature, Eigenvalues & Loss Landscapes",
    trackId: "math221",
    trackCode: "MATH 221",
    trackType: "course",
    trackTag: "green",
    engine: "Interactive HTML/CSS/JS",
    topic: "Second Derivatives, Hessian Condition Number & Optimization",
    desc: "Visualizes ill-conditioned loss ravines (λ_max >> λ_min), saddle points, and why Adam's second-moment estimation or Newton-Raphson curvature scaling outperforms vanilla SGD.",
    previewType: "eigen",
    previewSnippet: "Loss Contours ⇄ Hessian Matrix H = ∇²f [Condition Number κ]",
    html: `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace; }
  body { background: #0c0f17; color: #f8fafc; padding: 16px; }
  .head { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 10px; margin-bottom: 12px; }
  .canvas-box { position: relative; width: 100%; height: 260px; background: #030712; border: 1px solid #1e293b; border-radius: 8px; overflow: hidden; }
  canvas { width: 100%; height: 100%; display: block; }
  .controls { display: flex; gap: 8px; margin-top: 12px; }
  button { background: #1e293b; border: 1px solid #334155; color: #cbd5e1; padding: 6px 12px; border-radius: 6px; font-size: 11.5px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  button.active { background: #10b981; border-color: #34d399; color: #000; }
  .metrics { display: flex; gap: 12px; margin-top: 12px; background: #111827; padding: 10px 14px; border-radius: 6px; border: 1px solid #1f2937; }
  .metric { flex: 1; }
  .metric-l { font-size: 10px; color: #64748b; text-transform: uppercase; }
  .metric-v { font-size: 15px; font-weight: 700; color: #10b981; font-family: monospace; }
  .tip { margin-top: 10px; font-size: 11.5px; background: #064e3b20; border-left: 3px solid #10b981; padding: 8px 12px; border-radius: 0 6px 6px 0; color: #6ee7b7; }
</style>
</head>
<body>
  <div class="head">
    <div>
      <div style="font-size: 15px; font-weight: 700; color: #10b981;">Hessian Eigenvalues & Loss Surface Curvature</div>
      <div style="font-size: 11.5px; color: #94a3b8;">MATH 221 Quadratic Forms ➔ Neural Network Optimization (Adam vs SGD)</div>
    </div>
    <span style="background: #10b98120; color: #34d399; border: 1px solid #10b98140; padding: 2px 8px; border-radius: 999px; font-size: 10.5px;">Condition Number κ = λ₁ / λ₂</span>
  </div>

  <div class="canvas-box">
    <canvas id="lossCanvas"></canvas>
  </div>

  <div class="controls">
    <button id="btn-sgd" class="active" onclick="setOptimizer('sgd')">Vanilla SGD (Oscillates in Ravine)</button>
    <button id="btn-adam" onclick="setOptimizer('adam')">Adam Optimizer (Preconditioned Momentum)</button>
    <button onclick="resetPath()">↺ Re-Run Trajectory</button>
  </div>

  <div class="metrics">
    <div class="metric">
      <div class="metric-l">Hessian Eigenvalues</div>
      <div class="metric-v">λ₁ = 20.0, λ₂ = 1.0</div>
    </div>
    <div class="metric">
      <div class="metric-l">Condition Number (κ)</div>
      <div class="metric-v" style="color: #f59e0b;">κ = 20.0 (Ill-Conditioned)</div>
    </div>
    <div class="metric">
      <div class="metric-l">Steps to Convergence</div>
      <div class="metric-v" id="metric-steps" style="color: #38bdf8;">14 steps</div>
    </div>
  </div>

  <div class="tip">
    💡 <strong>Why ML Engineers study Linear Algebra:</strong> The Hessian matrix contains all second-order partial derivatives. When its condition number <code>κ = λ_max / λ_min</code> is large, gradients point perpendicular to the global minimum, causing SGD to bounce wildly across canyon walls. Adaptive optimizers (AdamW) invert curvature to achieve fast convergence.
  </div>

  <script>
    const canvas = document.getElementById('lossCanvas');
    const ctx = canvas.getContext('2d');
    let width, height;
    let opt = 'sgd';
    let path = [];

    function resize() {
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
      computePath();
      draw();
    }
    window.addEventListener('resize', resize);

    function computePath() {
      path = [];
      let x = -2.2, y = 1.8;
      path.push({x, y});

      if (opt === 'sgd') {
        const lr = 0.08;
        for(let i=0; i<30; i++) {
          const gx = 20 * x; // high curvature axis
          const gy = 1 * y;  // low curvature axis
          x = x - lr * gx * 0.45;
          y = y - lr * gy;
          path.push({x, y});
        }
        document.getElementById('metric-steps').innerText = '30+ steps (Oscillating)';
        document.getElementById('metric-steps').style.color = '#f87171';
      } else {
        // Adam with adaptive scaling
        let m_x = 0, m_y = 0;
        let v_x = 0, v_y = 0;
        const alpha = 0.18;
        for(let i=0; i<16; i++) {
          const gx = 20 * x;
          const gy = 1 * y;
          m_x = 0.9 * m_x + 0.1 * gx;
          m_y = 0.9 * m_y + 0.1 * gy;
          v_x = 0.99 * v_x + 0.01 * (gx*gx);
          v_y = 0.99 * v_y + 0.01 * (gy*gy);
          x = x - alpha * (m_x / (Math.sqrt(v_x) + 1e-4));
          y = y - alpha * (m_y / (Math.sqrt(v_y) + 1e-4));
          path.push({x, y});
        }
        document.getElementById('metric-steps').innerText = '12 steps (Direct Vector)';
        document.getElementById('metric-steps').style.color = '#34d399';
      }
    }

    function setOptimizer(o) {
      opt = o;
      document.getElementById('btn-sgd').className = o === 'sgd' ? 'active' : '';
      document.getElementById('btn-adam').className = o === 'adam' ? 'active' : '';
      computePath();
      draw();
    }

    function resetPath() {
      computePath();
      draw();
    }

    function draw() {
      if (!width || !height) return;
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const scaleX = width / 6;
      const scaleY = height / 4.5;

      // Draw elliptical loss contours
      for(let r=0.5; r<=3.5; r+=0.4) {
        ctx.beginPath();
        ctx.ellipse(cx, cy, (r * scaleX) / 2.8, r * scaleY, 0, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(52, 211, 153, ' + (0.1 + r*0.06) + ')';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Draw coordinate axes (Eigenvectors v1 and v2)
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, cy); ctx.lineTo(width, cy);
      ctx.moveTo(cx, 0); ctx.lineTo(cx, height);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '10px monospace';
      ctx.fillText('v1 (λ₁ = 20: High Curvature)', cx + 10, 16);
      ctx.fillText('v2 (λ₂ = 1: Valley Flatness)', width - 160, cy - 8);

      // Draw optimization path
      ctx.strokeStyle = opt === 'sgd' ? '#f87171' : '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for(let i=0; i<path.length; i++) {
        const px = cx + path[i].x * scaleX;
        const py = cy - path[i].y * scaleY;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Draw points
      for(let i=0; i<path.length; i++) {
        const px = cx + path[i].x * scaleX;
        const py = cy - path[i].y * scaleY;
        ctx.beginPath();
        ctx.arc(px, py, i === 0 ? 5 : (i === path.length-1 ? 6 : 2.5), 0, Math.PI * 2);
        ctx.fillStyle = i === 0 ? '#fbbf24' : (i === path.length-1 ? '#10b981' : (opt === 'sgd' ? '#f87171' : '#38bdf8'));
        ctx.fill();
      }
    }

    setTimeout(() => resize(), 50);
  </script>
</body>
</html>`
  },

  // ==========================================
  // AWS CCP: Cloud ML Architecture
  // ==========================================
  {
    id: "aws-sagemaker-distributed-pipeline",
    title: "AWS CCP: SageMaker Distributed Training & S3 Data Streaming",
    trackId: "aws_ccp",
    trackCode: "AWS CCP",
    trackType: "credential",
    trackTag: "purple",
    engine: "Interactive HTML/CSS/JS",
    topic: "Cloud Infrastructure, Distributed Training & Pipeline Orchestration",
    desc: "Simulates Amazon SageMaker distributed model parallelism across Multi-AZ GPU EC2 clusters (p4d.24xlarge) streaming petabyte dataset shards from Amazon S3 via Fast File Mode.",
    previewType: "cloud",
    previewSnippet: "S3 Sharded Dataset ➔ 4x p4d GPU Nodes via EFA 400Gbps",
    html: `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace; }
  body { background: #0f111a; color: #f1f5f9; padding: 16px; }
  .head { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 10px; margin-bottom: 14px; }
  .diagram { display: grid; grid-template-columns: 140px 60px 1fr; gap: 10px; align-items: center; margin-bottom: 16px; }
  .s3-bucket { background: #1e1b4b; border: 1.5px solid #818cf8; border-radius: 8px; padding: 14px; text-align: center; }
  .s3-icon { font-size: 28px; margin-bottom: 4px; }
  .stream-arrow { text-align: center; font-size: 18px; color: #c084fc; font-weight: bold; }
  .gpu-cluster { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .gpu-node { background: #131722; border: 1px solid #334155; border-radius: 6px; padding: 10px; }
  .gpu-node.active { border-color: #c084fc; box-shadow: 0 0 10px #c084fc30; }
  .gpu-title { font-size: 11px; font-weight: 700; color: #a855f7; display: flex; justify-content: space-between; margin-bottom: 6px; }
  .progress-bar { width: 100%; height: 8px; background: #030712; border-radius: 4px; overflow: hidden; margin-top: 6px; }
  .progress-fill { height: 100%; background: #c084fc; width: 0%; transition: width 0.3s; }
  .controls { display: flex; gap: 8px; margin-bottom: 12px; }
  button { background: #7c3aed; color: #fff; border: none; border-radius: 6px; padding: 7px 14px; font-size: 12px; font-weight: 600; cursor: pointer; transition: background 0.15s; }
  button:hover { background: #6d28d9; }
  button.sec { background: #1e293b; color: #cbd5e1; }
  .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; background: #07090e; padding: 12px; border-radius: 6px; border: 1px solid #1e293b; }
  .stat-l { font-size: 10px; color: #64748b; text-transform: uppercase; }
  .stat-v { font-size: 14.5px; font-weight: 700; color: #c084fc; font-family: monospace; }
  .note { margin-top: 12px; font-size: 11.5px; background: #2e106520; border-left: 3px solid #a855f7; padding: 8px 12px; border-radius: 0 6px 6px 0; color: #e9d5ff; }
</style>
</head>
<body>
  <div class="head">
    <div>
      <div style="font-size: 15px; font-weight: 700; color: #c084fc;">SageMaker Distributed Training & S3 Data Pipeline</div>
      <div style="font-size: 11.5px; color: #94a3b8;">AWS CCP Cloud Core ➔ Scaling 70B Parameter LLM Training Clusters</div>
    </div>
    <span style="background: #7c3aed20; color: #c084fc; border: 1px solid #7c3aed40; padding: 2px 8px; border-radius: 999px; font-size: 10.5px;">EFA 400 Gbps Fabric</span>
  </div>

  <div class="diagram">
    <!-- S3 Storage -->
    <div class="s3-bucket">
      <div class="s3-icon">🪣</div>
      <div style="font-size: 12px; font-weight: 700; color: #a5b4fc;">Amazon S3</div>
      <div style="font-size: 10px; color: #64748b; margin-top: 2px;">2.4 TB Training Shards</div>
      <div style="font-size: 9.5px; color: #34d399; margin-top: 6px;">Fast File Streaming</div>
    </div>

    <div class="stream-arrow">══➔</div>

    <!-- SageMaker Cluster -->
    <div class="gpu-cluster">
      <div class="gpu-node active" id="node-0">
        <div class="gpu-title"><span>ml.p4d Rank 0</span><span id="loss-0">Loss: 2.41</span></div>
        <div style="font-size: 10px; color: #94a3b8;">AllReduce Gradients</div>
        <div class="progress-bar"><div class="progress-fill" id="fill-0"></div></div>
      </div>
      <div class="gpu-node active" id="node-1">
        <div class="gpu-title"><span>ml.p4d Rank 1</span><span id="loss-1">Loss: 2.41</span></div>
        <div style="font-size: 10px; color: #94a3b8;">AllReduce Gradients</div>
        <div class="progress-bar"><div class="progress-fill" id="fill-1"></div></div>
      </div>
      <div class="gpu-node active" id="node-2">
        <div class="gpu-title"><span>ml.p4d Rank 2</span><span id="loss-2">Loss: 2.41</span></div>
        <div style="font-size: 10px; color: #94a3b8;">AllReduce Gradients</div>
        <div class="progress-bar"><div class="progress-fill" id="fill-2"></div></div>
      </div>
      <div class="gpu-node active" id="node-3">
        <div class="gpu-title"><span>ml.p4d Rank 3</span><span id="loss-3">Loss: 2.41</span></div>
        <div style="font-size: 10px; color: #94a3b8;">AllReduce Gradients</div>
        <div class="progress-bar"><div class="progress-fill" id="fill-3"></div></div>
      </div>
    </div>
  </div>

  <div class="controls">
    <button onclick="startTrainingBatch()">⚡ Pulse Training Epoch Batch</button>
    <button class="sec" onclick="resetTraining()">↺ Reset Cluster</button>
  </div>

  <div class="stats-grid">
    <div class="stat">
      <div class="stat-l">Cluster Cost</div>
      <div class="stat-v" style="color: #fbbf24;">Spot ($12.80/hr)</div>
    </div>
    <div class="stat">
      <div class="stat-l">Network Interconnect</div>
      <div class="stat-v">EFA (400 Gbps)</div>
    </div>
    <div class="stat">
      <div class="stat-l">Training Throughput</div>
      <div class="stat-v" id="stat-tps" style="color: #34d399;">1,420 tokens/sec</div>
    </div>
    <div class="stat">
      <div class="stat-l">Global Step</div>
      <div class="stat-v" id="stat-step">Step 0 / 1000</div>
    </div>
  </div>

  <div class="note">
    💡 <strong>Cloud ML Engineering Context:</strong> The AWS Certified Cloud Practitioner exam covers Shared Responsibility, Well-Architected Framework, and cost optimization. In production ML, training multi-billion parameter models requires <strong>Elastic Fabric Adapter (EFA)</strong> to bypass OS network overhead for GPU-to-GPU NCCL AllReduce synchronizations.
  </div>

  <script>
    let step = 0;
    let currentLoss = 2.41;

    function startTrainingBatch() {
      step += 50;
      currentLoss = Math.max(0.42, (currentLoss * 0.91)).toFixed(2);
      const pct = Math.min(100, (step / 500) * 100);

      for(let i=0; i<4; i++) {
        document.getElementById('fill-' + i).style.width = pct + '%';
        document.getElementById('loss-' + i).innerText = 'Loss: ' + currentLoss;
      }

      document.getElementById('stat-step').innerText = 'Step ' + step + ' / 1000';
      document.getElementById('stat-tps').innerText = (1420 + Math.floor(Math.random() * 80)) + ' tokens/sec';
    }

    function resetTraining() {
      step = 0;
      currentLoss = 2.41;
      for(let i=0; i<4; i++) {
        document.getElementById('fill-' + i).style.width = '0%';
        document.getElementById('loss-' + i).innerText = 'Loss: 2.41';
      }
      document.getElementById('stat-step').innerText = 'Step 0 / 1000';
    }
  </script>
</body>
</html>`
  }
];
