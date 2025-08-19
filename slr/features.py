from __future__ import annotations

from typing import List, Sequence, Tuple
import math

from .hand import HandLandmarks


NUM_LANDMARKS = 21


def _normalize_landmarks(landmarks: Sequence[Tuple[float, float, float]]) -> List[float]:
	"""Normalize landmarks to be translation and scale invariant.

	- Translate so wrist (index 0) is origin
	- Scale so average distance to wrist is 1
	- Return concatenated [x, y, z] for each landmark
	"""
	if len(landmarks) != NUM_LANDMARKS:
		return []
	wx, wy, wz = landmarks[0]
	shifted = [(x - wx, y - wy, z - wz) for (x, y, z) in landmarks]
	dists = [math.sqrt(x * x + y * y + z * z) for (x, y, z) in shifted[1:]]
	mean_dist = sum(dists) / max(len(dists), 1)
	scale = 1.0 / mean_dist if mean_dist > 1e-6 else 1.0
	normalized = []
	for (x, y, z) in shifted:
		normalized.extend([x * scale, y * scale, z * scale])
	return normalized


def landmarks_to_feature_vector(hands: List[HandLandmarks]) -> List[float]:
	"""Convert possibly two hands to a single fixed-length feature vector.

	Concatenate normalized vectors for left and right. If only one hand is
	available, pad the other with zeros.
	"""
	left: List[float] = []
	right: List[float] = []
	for hand in hands:
		if hand.handedness == "Left":
			left = _normalize_landmarks(hand.landmarks)
		elif hand.handedness == "Right":
			right = _normalize_landmarks(hand.landmarks)
		else:
			# If unknown handedness, place in left if empty else right
			if not left:
				left = _normalize_landmarks(hand.landmarks)
			elif not right:
				right = _normalize_landmarks(hand.landmarks)

	feature_size_single = NUM_LANDMARKS * 3
	if not left:
		left = [0.0] * feature_size_single
	if not right:
		right = [0.0] * feature_size_single
	return left + right

