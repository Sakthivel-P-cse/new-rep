from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

# Load CodeLlama model (7B version for CPU, or try 13B for GPU)
MODEL_NAME = "codellama/CodeLlama-7b-hf"

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForCausalLM.from_pretrained(MODEL_NAME)

def analyze_code(code: str) -> float:
    """
    Returns a confidence score that code is AI-generated (0.0=human, 1.0=AI)
    """
    prompt = f"Is the following code likely written by an AI or a human? Answer 'AI' or 'Human'.\n{code}\nAnswer:"
    inputs = tokenizer(prompt, return_tensors="pt", truncation=True, max_length=512)
    with torch.no_grad():
        outputs = model.generate(**inputs, max_new_tokens=10)
    answer = tokenizer.decode(outputs[0], skip_special_tokens=True)
    # Simple scoring: if 'AI' in answer, return 1.0; else 0.0
    if "AI" in answer:
        return 1.0
    return 0.0
