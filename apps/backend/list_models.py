import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv(".env")

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    # Try getting it from settings if .env loading differs
    # But for this script simple .env load is best
    print("GEMINI_API_KEY not found in apps/backend/.env")
    exit(1)

genai.configure(api_key=api_key)

print("List of available models:")
try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(m.name)
except Exception as e:
    print(f"Error listing models: {e}")
