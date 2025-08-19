from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Tuple

import joblib
import numpy as np
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC


@dataclass
class TrainResult:
	model_path: Path
	report: str
	labels: List[str]


def train_svm_classifier(
	features: List[List[float]],
	labels: List[str],
	model_out: Path,
	kernel: str = "rbf",
	c: float = 10.0,
	gamma: str | float = "scale",
) -> TrainResult:
	X = np.array(features, dtype=np.float32)
	y = np.array(labels)
	X_train, X_val, y_train, y_val = train_test_split(
		X, y, test_size=0.2, random_state=42, stratify=y if len(set(y)) > 1 else None
	)
	pipeline = Pipeline([
		("scaler", StandardScaler()),
		("clf", SVC(kernel=kernel, C=c, gamma=gamma, probability=True)),
	])
	pipeline.fit(X_train, y_train)
	y_pred = pipeline.predict(X_val) if len(y_val) > 0 else []
	report = (
		classification_report(y_val, y_pred) if len(y_val) > 0 else "Insufficient validation data"
	)
	model_out = Path(model_out)
	model_out.parent.mkdir(parents=True, exist_ok=True)
	joblib.dump({"pipeline": pipeline, "labels": sorted(list(set(labels)))}, model_out)
	return TrainResult(model_path=model_out, report=report, labels=sorted(list(set(labels))))


def load_model(model_path: Path):
	obj = joblib.load(model_path)
	return obj["pipeline"], obj.get("labels")

