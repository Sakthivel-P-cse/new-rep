from transformers import AutoTokenizer, AutoModelForCausalLM

MODEL_NAME = "microsoft/phi-3-mini-4k-instruct"

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForCausalLM.from_pretrained(MODEL_NAME)

def analyze_code(code: str) -> float:
    prompt = f"Is the following code written by an AI or a human? Answer 'AI' or 'Human'.\n{code}\nAnswer:"
    inputs = tokenizer(prompt, return_tensors="pt", truncation=True)
    outputs = model.generate(**inputs, max_new_tokens=10)
    answer = tokenizer.decode(outputs[0], skip_special_tokens=True)
    if "AI" in answer:
        return 1.0
    return 0.0
