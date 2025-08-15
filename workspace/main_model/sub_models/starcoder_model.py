from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

MODEL_NAME = "bigcode/starcoder"

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForCausalLM.from_pretrained(MODEL_NAME)

def analyze_code(code: str) -> float:
    """
    Returns a confidence score that code is AI-generated (0.0=human, 1.0=AI)
    """
    prompt = f"Is the following code written by an AI or a human? Answer with 'AI' or 'Human'.\n{code}\nAnswer:"
    inputs = tokenizer(prompt, return_tensors="pt", truncation=True, max_length=512)
    with torch.no_grad():
        outputs = model.generate(**inputs, max_new_tokens=10)
    answer = tokenizer.decode(outputs[0], skip_special_tokens=True)
    if "AI" in answer:
        return 1.0
    return 0.0
