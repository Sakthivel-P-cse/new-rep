import argparse
import json
import os
import re
import sqlite3
from typing import Dict, List, Optional, Tuple

# Import sub-models
from sub_models import (
    python_model,
    cpp_model,
    java_model,
    javascript_model,
    csharp_model,
    php_model,
    ruby_model,
    go_model,
    swift_model,
    rust_model,
)

DB_PATH = os.path.join(os.path.dirname(__file__), "database", "submissions.db")

LANG_EXT_MAP = {
    ".py": "Python",
    ".cpp": "C++",
    ".cc": "C++",
    ".hpp": "C++",
    ".h": "C++",
    ".cxx": "C++",
    ".java": "Java",
    ".js": "JavaScript",
    ".mjs": "JavaScript",
    ".cjs": "JavaScript",
    ".cs": "C#",
    ".php": "PHP",
    ".rb": "Ruby",
    ".go": "Go",
    ".swift": "Swift",
    ".rs": "Rust",
}

LANG_MODELS = {
    "Python": python_model,
    "C++": cpp_model,
    "Java": java_model,
    "JavaScript": javascript_model,
    "C#": csharp_model,
    "PHP": php_model,
    "Ruby": ruby_model,
    "Go": go_model,
    "Swift": swift_model,
    "Rust": rust_model,
}

LANG_KEYWORDS = {
    "Python": ["def", "import", "from", "class", "yield", "async", "await", "lambda"],
    "C++": ["#include", "std::", "namespace", "template", "cout", "cin", "::", "auto"],
    "Java": ["public", "static", "void", "class", "new", "import", "package", "System.out"],
    "JavaScript": ["function", "const", "let", "var", "=>", "console.log", "import", "export"],
    "C#": ["using", "namespace", "class", "public", "static", "void", "var", "Console.WriteLine"],
    "PHP": ["<?php", "echo", "function", "use", "namespace", "class"],
    "Ruby": ["def", "end", "class", "module", "require"],
    "Go": ["package", "import", "func", "fmt.", "defer", "go ", "select", "chan"],
    "Swift": ["import", "let", "var", "func", "class", "struct", "print("],
    "Rust": ["fn ", "let ", "mut ", "use ", "pub ", "crate", "println!", "::"],
}


def detect_language(code: str, filename: Optional[str]) -> str:
    if filename:
        _, ext = os.path.splitext(filename)
        if ext in LANG_EXT_MAP:
            return LANG_EXT_MAP[ext]
    # Fallback: keyword-based scoring
    code_lower = code.lower()
    scores: Dict[str, int] = {}
    for lang, keywords in LANG_KEYWORDS.items():
        scores[lang] = sum(1 for k in keywords if k.lower() in code_lower)
    # Heuristics for PHP opening tag
    if code_lower.strip().startswith("<?php"):
        return "PHP"
    # Choose highest score; default Python
    return max(scores.items(), key=lambda kv: kv[1])[0] if scores else "Python"


# --- Plagiarism utilities ---

def tokenize(code: str) -> List[str]:
    return [t for t in re.split(r"\W+", code) if t]


def jaccard_similarity(a_tokens: List[str], b_tokens: List[str]) -> float:
    set_a = set(a_tokens)
    set_b = set(b_tokens)
    if not set_a and not set_b:
        return 1.0
    return len(set_a & set_b) / max(1, len(set_a | set_b))


def levenshtein_distance(a: str, b: str) -> int:
    if a == b:
        return 0
    if not a:
        return len(b)
    if not b:
        return len(a)
    # Use a memory-efficient DP
    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a, start=1):
        curr = [i]
        for j, cb in enumerate(b, start=1):
            cost = 0 if ca == cb else 1
            curr.append(min(
                curr[-1] + 1,            # insertion
                prev[j] + 1,              # deletion
                prev[j - 1] + cost        # substitution
            ))
        prev = curr
    return prev[-1]


def normalized_levenshtein_similarity(a: str, b: str) -> float:
    max_len = max(len(a), len(b))
    if max_len == 0:
        return 1.0
    # Truncate to limit heavy computations
    a_trunc = a[:5000]
    b_trunc = b[:5000]
    dist = levenshtein_distance(a_trunc, b_trunc)
    return max(0.0, 1.0 - (dist / max(1, max(len(a_trunc), len(b_trunc)))))


def combined_similarity(a_code: str, b_code: str) -> float:
    a_tokens = tokenize(a_code)
    b_tokens = tokenize(b_code)
    jacc = jaccard_similarity(a_tokens, b_tokens)
    lev = normalized_levenshtein_similarity(a_code, b_code)
    # Weighted combination
    return 0.6 * jacc + 0.4 * lev


def connect_db() -> sqlite3.Connection:
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    return conn


def fetch_previous_submissions(conn: sqlite3.Connection, language: str) -> List[Tuple[int, str, str]]:
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS submissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            language TEXT,
            code TEXT
        );
        """
    )
    rows = conn.execute("SELECT id, language, code FROM submissions WHERE language = ?", (language,)).fetchall()
    return rows


def compute_plagiarism(code: str, previous: List[Tuple[int, str, str]]) -> float:
    if not previous:
        return 0.0
    sims = [combined_similarity(code, row[2]) for row in previous]
    return max(sims) * 100.0


def call_language_model(language: str, code: str) -> float:
    model = LANG_MODELS.get(language)
    if not model:
        # Default to Python model if unknown
        model = python_model
    return float(model.analyze_code(code))


def main() -> None:
    parser = argparse.ArgumentParser(description="AI Code Detection Controller")
    src_group = parser.add_mutually_exclusive_group(required=True)
    src_group.add_argument("--code", type=str, help="Code string to analyze")
    src_group.add_argument("--code-file", type=str, help="Path to code file to analyze")
    parser.add_argument("--filename", type=str, default=None, help="Original filename (for extension-based detection)")
    parser.add_argument("--insert", action="store_true", help="Insert this submission into the local database after analysis")
    args = parser.parse_args()

    if args.code_file:
        with open(args.code_file, "r", encoding="utf-8") as f:
            code = f.read()
        filename = args.filename or os.path.basename(args.code_file)
    else:
        code = args.code
        filename = args.filename

    language = detect_language(code, filename)

    # Database plagiarism check
    conn = connect_db()
    try:
        previous = fetch_previous_submissions(conn, language)
        plagiarism_percentage = compute_plagiarism(code, previous)
        is_plagiarized = plagiarism_percentage > 80.0

        # Call sub-model for AI likelihood
        ai_percentage = call_language_model(language, code)

        result = {
            "language": language,
            "ai_percentage": round(ai_percentage, 2),
            "plagiarism_percentage": round(plagiarism_percentage, 2),
            "is_plagiarized": bool(is_plagiarized),
        }

        print(json.dumps(result, ensure_ascii=False))

        if args.insert:
            conn.execute("INSERT INTO submissions(language, code) VALUES(?, ?)", (language, code))
            conn.commit()
    finally:
        conn.close()


if __name__ == "__main__":
    main()

