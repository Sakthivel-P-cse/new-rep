## Sign Language Recognition (SLR)

This project uses MediaPipe Hands and a simple SVM classifier to recognize sign language gestures from a webcam and output text.

### Setup

1. Create a Python 3.10+ environment.
2. Install dependencies:

```
pip install -r requirements.txt
```

### Data Collection

Record samples for each label you want to recognize. Run this per label, aiming for ~200-500 frames per label captured from different angles.

```
python scripts/collect_data.py HELLO --out data/dataset.csv --frames 300
python scripts/collect_data.py THANKS --out data/dataset.csv --frames 300
python scripts/collect_data.py YES --out data/dataset.csv --frames 300
python scripts/collect_data.py NO --out data/dataset.csv --frames 300
```

You can add more labels in all caps with no spaces, or use underscores, e.g., `GOOD_MORNING`.

### Training

Train an SVM classifier on the collected data:

```
python scripts/train.py --data data/dataset.csv --out models/slr_svm.joblib
```

### Real-time Inference

Run the webcam recognizer. It will show per-frame predictions, smooth them over time, and build a text phrase as stable labels are detected.

```
python scripts/infer.py --model models/slr_svm.joblib
```

Press `q` to quit any window.

### Notes

- The pipeline converts MediaPipe 21-point hand landmarks into a normalized feature vector (left + right hand). If only one hand is visible, the other is zero-padded.
- The temporal label smoother reduces flicker; adjust parameters in `slr/text_buffer.py` for responsiveness vs stability.
- To expand accuracy, collect more diverse data per label and consider trying more advanced models.