import contextlib
from dataclasses import dataclass
from typing import Iterator, List, Optional, Tuple

import cv2
try:
	import mediapipe as mp
except Exception as _exc:
	mp = None  # type: ignore
	_MEDIAPIPE_IMPORT_ERROR = _exc


@dataclass
class HandLandmarks:
	"""Container for a single hand's landmarks normalized to image size.

	Attributes:
	- landmarks: List of (x, y, z) floats in pixel coordinates relative to the frame
	- handedness: Optional string like "Left" or "Right"
	"""
	landmarks: List[Tuple[float, float, float]]
	handedness: Optional[str]


class MediaPipeHandDetector:
	"""Thin wrapper around MediaPipe Hands for easy iteration over frames."""

	def __init__(
		self,
		min_detection_confidence: float = 0.8,
		min_tracking_confidence: float = 0.5,
		max_num_hands: int = 2,
	):
		if mp is None:
			raise RuntimeError(
				"mediapipe is not installed or not supported on this Python version. "
				"Install mediapipe on Python 3.10-3.12 and run in that interpreter. "
				f"Original import error: {_MEDIAPIPE_IMPORT_ERROR}"
			)
		self._mp_hands = mp.solutions.hands
		self._mp_drawing = mp.solutions.drawing_utils
		self._hands = self._mp_hands.Hands(
			model_complexity=1,
			min_detection_confidence=min_detection_confidence,
			min_tracking_confidence=min_tracking_confidence,
			max_num_hands=max_num_hands,
		)

	def process_bgr_frame(self, frame_bgr) -> Tuple[List[HandLandmarks], any]:
		"""Process a BGR frame and return detected landmarks and a visualization frame."""
		frame_bgr = cv2.flip(frame_bgr, 1)
		image_rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
		results = self._hands.process(image_rgb)
		landmarks_all: List[HandLandmarks] = []
		if results.multi_hand_landmarks:
			for idx, hand_lms in enumerate(results.multi_hand_landmarks):
				landmarks: List[Tuple[float, float, float]] = []
				for lm in hand_lms.landmark:
					landmarks.append((lm.x, lm.y, lm.z))
				handedness = None
				if results.multi_handedness and idx < len(results.multi_handedness):
					handedness = results.multi_handedness[idx].classification[0].label
				landmarks_all.append(HandLandmarks(landmarks=landmarks, handedness=handedness))

		vis_bgr = frame_bgr.copy()
		if results.multi_hand_landmarks:
			for hand_lms in results.multi_hand_landmarks:
				self._mp_drawing.draw_landmarks(
					vis_bgr,
					hand_lms,
					self._mp_hands.HAND_CONNECTIONS,
					landmark_drawing_spec=self._mp_drawing.DrawingSpec(
						color=(255, 0, 255), thickness=4, circle_radius=2
					),
					connection_drawing_spec=self._mp_drawing.DrawingSpec(
						color=(20, 180, 90), thickness=2, circle_radius=2
					),
				)
		return landmarks_all, vis_bgr

	def close(self) -> None:
		self._hands.close()


@contextlib.contextmanager
def webcam_capture(device_index: int = 0) -> Iterator[cv2.VideoCapture]:
	capture = cv2.VideoCapture(device_index)
	try:
		yield capture
	finally:
		capture.release()