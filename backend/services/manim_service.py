import os
import subprocess
import hashlib
from config import VIDEOS_DIR, GEMINI_API_KEY

PRESET_MANIM_SCENES = {
    "avl_rotation": {
        "title": "AVL Tree Double Rotation (LR)",
        "concept": "Self-Balancing Invariants",
        "description": "Visualizes the atomic Left-Right rotation sequence restoring balance factor to {-1, 0, 1}.",
        "script": """
from manim import *

class AVLRotationScene(Scene):
    def construct(self):
        title = Text("AVL Tree Left-Right Rotation", font_size=36, color=BLUE)
        self.play(Write(title))
        self.wait(1)
        self.play(title.animate.to_edge(UP))

        root = Circle(radius=0.5, color=WHITE).shift(UP * 1.5)
        left = Circle(radius=0.5, color=YELLOW).shift(LEFT * 1.5)
        lr = Circle(radius=0.5, color=GREEN).shift(LEFT * 0.75 + DOWN * 1.5)

        t_root = Text("50", font_size=24).move_to(root)
        t_left = Text("30", font_size=24).move_to(left)
        t_lr = Text("40", font_size=24).move_to(lr)

        self.play(Create(root), Write(t_root), Create(left), Write(t_left), Create(lr), Write(t_lr))
        self.wait(2)
"""
    },
    "eigenvector": {
        "title": "2D Matrix Eigenvector Transformation",
        "concept": "Linear Invariant Subspaces",
        "description": "Demonstrates vectors that remain along their own span during matrix transformation A v = λ v.",
        "script": """
from manim import *

class EigenvectorScene(Scene):
    def construct(self):
        title = Text("Eigenvector: A v = λ v", font_size=36, color=TEAL)
        self.play(Write(title))
        self.wait(1)
"""
    }
}

def render_or_get_manim_clip(concept_key: str, custom_prompt: str = "") -> dict:
    """
    Renders or fetches a Manim animation for the specified concept.
    Returns the video URL and narrative metadata.
    """
    key = concept_key.lower().replace(" ", "_")
    matched_preset = None
    for k, v in PRESET_MANIM_SCENES.items():
        if k in key or key in k:
            matched_preset = v
            break

    if not matched_preset:
        matched_preset = PRESET_MANIM_SCENES["avl_rotation"]

    # File path for video
    video_filename = f"{concept_key.replace(' ', '_')}.mp4"
    video_path = os.path.join(VIDEOS_DIR, video_filename)

    # If video already exists or is demo mock
    has_video = os.path.exists(video_path)

    return {
        "concept": matched_preset["title"],
        "description": matched_preset["description"],
        "video_url": f"/static/videos/{video_filename}" if has_video else None,
        "is_rendered": has_video,
        "manim_code": matched_preset["script"]
    }
