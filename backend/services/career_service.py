"""
DoIT Track: Career Pathways & Degree ROI Service
Maps synthetic and alumni university dataset records across course concepts,
market skills, starting salary bands (Maryland / Baltimore-DC Metro), and career outcomes.
"""

CAREER_MAPPINGS = {
    "cmsc341": {
        "course_code": "CMSC 341",
        "course_name": "Data Structures & Algorithms",
        "primary_skills": ["Self-Balancing Trees", "Asymptotic Analysis", "Graph Frontiers", "Memory Hierarchies"],
        "career_pathways": [
            {
                "title": "Systems Software Architect",
                "median_starting_salary": "$128,000",
                "salary_range": "$115,000 - $145,000",
                "metro_area": "Baltimore - Washington DC Tech Corridor",
                "market_demand": "Very High (Top 5% employer demand)",
                "key_skill_connection": "AVL tree invariants & amortized complexity are direct interview competencies for low-latency systems and cloud infrastructure."
            },
            {
                "title": "Distributed Backend Engineer",
                "median_starting_salary": "$122,000",
                "salary_range": "$108,000 - $138,000",
                "metro_area": "Maryland Cyber / National Security Cluster",
                "market_demand": "High",
                "key_skill_connection": "Graph traversal (BFS/DFS) and hashing collision avoidance power distributed routing and database indexing."
            }
        ],
        "degree_roi_multiplier": "1.34x vs average STEM bachelor baseline"
    },
    "math221": {
        "course_code": "MATH 221",
        "course_name": "Linear Algebra & Matrices",
        "primary_skills": ["Eigenvalues & Eigenvectors", "Vector Projections", "Matrix Factorization", "Orthogonality"],
        "career_pathways": [
            {
                "title": "Quantitative Research Analyst",
                "median_starting_salary": "$135,000",
                "salary_range": "$120,000 - $155,000",
                "metro_area": "Mid-Atlantic FinTech & Asset Management",
                "market_demand": "Very High",
                "key_skill_connection": "Matrix decomposition (SVD, QR, Gram-Schmidt) forms the foundation of modern quantitative portfolio modeling and algorithmic trading."
            },
            {
                "title": "Computer Vision & Graphics Engineer",
                "median_starting_salary": "$126,000",
                "salary_range": "$112,000 - $140,000",
                "metro_area": "Baltimore Tech Hub",
                "market_demand": "High",
                "key_skill_connection": "Affine transformations, 3D coordinate rotations, and null spaces drive spatial computing and gaming rendering engines."
            }
        ],
        "degree_roi_multiplier": "1.41x vs average STEM bachelor baseline"
    },
    "entr201": {
        "course_code": "ENTR 201",
        "course_name": "Tech Venture Studio",
        "primary_skills": ["SaaS Unit Economics", "Customer Discovery", "Venture Valuation", "LTV/CAC Dynamics"],
        "career_pathways": [
            {
                "title": "Venture Product Lead / Tech Founder",
                "median_starting_salary": "$115,000",
                "salary_range": "$95,000 - $140,000 + Equity",
                "metro_area": "National / Remote Ecosystems",
                "market_demand": "High Growth",
                "key_skill_connection": "Mastering unit economics, product retention cohorts, and payback periods separates funded ventures from failed prototypes."
            }
        ],
        "degree_roi_multiplier": "1.28x with significant equity upside"
    },
    "cmsc471": {
        "course_code": "CMSC 471",
        "course_name": "Intro to AI & Machine Learning",
        "primary_skills": ["Heuristic State Search", "A* Optimality", "Neural Representations", "Markov Decision Processes"],
        "career_pathways": [
            {
                "title": "Applied AI / Machine Learning Engineer",
                "median_starting_salary": "$132,000",
                "salary_range": "$118,000 - $150,000",
                "metro_area": "DC Intelligence & Autonomous Systems",
                "market_demand": "Extremely High (Highest in region)",
                "key_skill_connection": "State-space heuristic search and cost optimization are foundational to autonomous robotics, agentic AI, and route planning."
            }
        ],
        "degree_roi_multiplier": "1.45x vs average STEM bachelor baseline"
    }
}

def get_course_career_roi(course_id: str):
    cid = course_id.lower().replace(" ", "").replace("-", "")
    return CAREER_MAPPINGS.get(cid, CAREER_MAPPINGS["cmsc341"])
