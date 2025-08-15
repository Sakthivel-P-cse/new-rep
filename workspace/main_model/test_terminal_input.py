from sub_models.phi3_model import analyze_code

def main():
    print("AI Code Detector - Terminal Input (Phi-3-mini)")
    print("===============================================")
    print("Paste your code below. End input with Ctrl+D (Linux/Mac) or Ctrl+Z (Windows) and Enter.")
    print("-----------------------------------------------")
    try:
        code = ""
        while True:
            line = input()
            code += line + "\n"
    except EOFError:
        pass

    score = analyze_code(code)
    result = "AI-Generated" if score >= 0.5 else "Human"
    print("\n--- Detection Result ---")
    print(f"Score: {score:.2f}")
    print(f"Result: {result}")

if __name__ == "__main__":
    main()
