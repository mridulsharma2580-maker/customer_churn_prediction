import os
import sys
import unittest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.ml.train import build_confusion_matrix


class ConfusionMatrixTests(unittest.TestCase):
    def test_build_confusion_matrix_returns_expected_counts(self):
        y_true = [0, 1, 0, 1, 1]
        y_pred = [0, 1, 1, 1, 0]

        cm = build_confusion_matrix(y_true, y_pred)

        self.assertEqual(cm["true_negative"], 1)
        self.assertEqual(cm["false_positive"], 1)
        self.assertEqual(cm["false_negative"], 1)
        self.assertEqual(cm["true_positive"], 2)


if __name__ == "__main__":
    unittest.main()
