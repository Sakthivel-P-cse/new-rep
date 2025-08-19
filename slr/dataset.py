from __future__ import annotations

import csv
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Tuple


@dataclass
class Sample:
	features: List[float]
	label: str


class CsvDataset:
	"""Simple CSV-backed dataset for SLR features.

	CSV columns: f0, f1, ..., fN, label
	"""

	def __init__(self, csv_path: Path):
		self.csv_path = Path(csv_path)
		self.csv_path.parent.mkdir(parents=True, exist_ok=True)

	def append(self, sample: Sample) -> None:
		with self.csv_path.open("a", newline="") as f:
			writer = csv.writer(f)
			writer.writerow([*sample.features, sample.label])

	def read_all(self) -> Tuple[List[List[float]], List[str]]:
		features: List[List[float]] = []
		labels: List[str] = []
		if not self.csv_path.exists():
			return features, labels
		with self.csv_path.open("r", newline="") as f:
			reader = csv.reader(f)
			for row in reader:
				if not row:
					continue
				features.append([float(x) for x in row[:-1]])
				labels.append(row[-1])
		return features, labels

