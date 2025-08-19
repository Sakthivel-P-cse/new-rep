#!/usr/bin/env python3
import argparse
from pathlib import Path

from slr.dataset import CsvDataset
from slr.classifier import train_svm_classifier


def main():
	parser = argparse.ArgumentParser(description="Train SLR classifier from CSV dataset")
	parser.add_argument("--data", dest="data", type=Path, default=Path("data/dataset.csv"))
	parser.add_argument("--out", dest="out", type=Path, default=Path("models/slr_svm.joblib"))
	args = parser.parse_args()

	dataset = CsvDataset(args.data)
	X, y = dataset.read_all()
	if not X or not y:
		print("No training data found. Use scripts/collect_data.py to record samples.")
		return

	res = train_svm_classifier(X, y, args.out)
	print("Model saved to:", res.model_path)
	print(res.report)


if __name__ == "__main__":
	main()

