#!/usr/bin/env python3
import argparse
from pathlib import Path

import cv2
import numpy as np

from slr.hand import MediaPipeHandDetector, webcam_capture
from slr.features import landmarks_to_feature_vector
from slr.classifier import load_model
from slr.text_buffer import TemporalLabelSmoother, TextBuilder


def main():
	parser = argparse.ArgumentParser(description="Real-time SLR inference from webcam")
	parser.add_argument("--model", dest="model", type=Path, default=Path("models/slr_svm.joblib"))
	parser.add_argument("--labels", dest="labels", type=str, nargs='*', default=None, help="Optional label list to display")
	args = parser.parse_args()

	pipeline, saved_labels = load_model(args.model)
	known_labels = args.labels or saved_labels or []

	detector = MediaPipeHandDetector()
	smoother = TemporalLabelSmoother()
	text_builder = TextBuilder()

	with webcam_capture() as cap:
		while cap.isOpened():
			ret, frame = cap.read()
			if not ret:
				break
			hands, vis = detector.process_bgr_frame(frame)
			feat = landmarks_to_feature_vector(hands)
			pred_label = None
			if feat and any(feat):
				proba = pipeline.predict_proba([feat])[0]
				idx = int(np.argmax(proba))
				pred_label = pipeline.classes_[idx]
				conf = float(proba[idx])
				cv2.putText(vis, f"{pred_label} {conf:.2f}", (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 255), 2)
			stable = smoother.push(pred_label or "") if pred_label else None
			if stable:
				phrase = text_builder.push_label(stable)
				if phrase:
					cv2.putText(vis, phrase, (10, 100), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 255, 255), 2)
			cv2.imshow("SLR Inference - press q to quit", vis)
			if cv2.waitKey(1) & 0xFF == ord('q'):
				break

		detector.close()
		cv2.destroyAllWindows()


if __name__ == "__main__":
	main()

