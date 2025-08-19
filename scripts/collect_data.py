#!/usr/bin/env python3
import argparse
from pathlib import Path
from typing import Optional

import cv2

from slr.hand import MediaPipeHandDetector, webcam_capture
from slr.features import landmarks_to_feature_vector
from slr.dataset import CsvDataset, Sample


def main():
	parser = argparse.ArgumentParser(description="Collect SLR training data from webcam")
	parser.add_argument("label", type=str, help="Label to record, e.g. HELLO")
	parser.add_argument("--out", dest="out", type=Path, default=Path("data/dataset.csv"))
	parser.add_argument("--frames", dest="frames", type=int, default=200)
	args = parser.parse_args()

	dataset = CsvDataset(args.out)
	detector = MediaPipeHandDetector()

	with webcam_capture() as cap:
		count = 0
		while cap.isOpened() and count < args.frames:
			ret, frame = cap.read()
			if not ret:
				break
			hands, vis = detector.process_bgr_frame(frame)
			feat = landmarks_to_feature_vector(hands)
			if feat and any(feat):
				dataset.append(Sample(features=feat, label=args.label))
				count += 1
				cv2.putText(vis, f"Recording {args.label} {count}/{args.frames}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 200, 0), 2)
			else:
				cv2.putText(vis, "Show hands to record", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
			cv2.imshow("Collect Data - press q to quit", vis)
			if cv2.waitKey(1) & 0xFF == ord('q'):
				break

		detector.close()
		cv2.destroyAllWindows()


if __name__ == "__main__":
	main()

