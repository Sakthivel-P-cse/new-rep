from .model_utils import analyze_with_weights


def analyze_code(code: str) -> float:
    weights = {
        "bias": -0.2,
        "comment_ratio": 0.4,
        "avg_line_length_scaled": -0.15,
        "empty_line_ratio": -0.15,
        "string_literal_ratio": 0.15,
        "ai_marker_ratio": 4.0,
        "docstring_present": 0.0,
        "todo_ratio": 0.2,
        "english_comment_density": 0.5,
        "snake_case_ratio": 0.2,
        "camel_case_ratio": 0.2,
        "pascal_case_ratio": 0.1,
        "identifier_avg_length_scaled": -0.1,
        "complexity_ratio": -0.1,
        "import_count_scaled": 0.2,
        "keyword_presence_ratio": 0.5,
        "indent_consistency": 0.3,
    }
    return analyze_with_weights(code, "PHP", weights)

