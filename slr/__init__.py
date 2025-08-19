"""Sign Language Recognition (SLR) package.

Modules:
- hand: Hand landmark detection using MediaPipe
- features: Landmark-to-feature vector conversion utilities
- dataset: Dataset IO helpers for feature/label storage
- classifier: Training and inference utilities for classifiers
- text_buffer: Temporal smoothing and text construction utilities
"""

__all__ = [
	"hand",
	"features",
	"dataset",
	"classifier",
	"text_buffer",
]

