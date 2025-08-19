from __future__ import annotations

from collections import deque, Counter
from dataclasses import dataclass
from typing import Deque, List, Optional


@dataclass
class TemporalLabelSmoother:
	"""Smooth frame-wise predictions into stable labels."""
	window_size: int = 8
	min_count: int = 4

	def __post_init__(self):
		self._window: Deque[str] = deque(maxlen=self.window_size)

	def push(self, label: str) -> Optional[str]:
		self._window.append(label)
		counts = Counter(self._window)
		label, count = counts.most_common(1)[0]
		if count >= self.min_count:
			return label
		return None


@dataclass
class TextBuilder:
	"""Build human-readable text from stable labels."""
	append_repeat: bool = False

	def __post_init__(self):
		self._last_label: Optional[str] = None
		self._words: List[str] = []

	def push_label(self, label: str) -> Optional[str]:
		if not label:
			return None
		if label == self._last_label and not self.append_repeat:
			return None
		self._last_label = label
		self._words.append(label)
		return " ".join(self._words)

	def reset(self) -> None:
		self._last_label = None
		self._words.clear()

