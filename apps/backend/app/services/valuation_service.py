import json
import os
from pathlib import Path
from typing import Dict, Any

import google.generativeai as genai
from jinja2 import Template

from app.core.config import settings

class ValuationService:
    def __init__(self):
        if settings.gemini_api_key:
            genai.configure(api_key=settings.gemini_api_key.get_secret_value())
            self.model = genai.GenerativeModel('gemini-pro')
        else:
            self.model = None
            print("WARNING: GEMINI_API_KEY not set. Valuation service will not work.")

        self.prompt_template_path = Path(__file__).parent.parent / "prompts" / "valuation.txt"

    def _load_prompt(self, metrics: Dict[str, Any]) -> str:
        if not self.prompt_template_path.exists():
            raise FileNotFoundError(f"Prompt template not found at {self.prompt_template_path}")
        
        with open(self.prompt_template_path, "r") as f:
            template_content = f.read()
        
        template = Template(template_content)
        return template.render(**metrics)

    async def generate_valuation(self, metrics: Dict[str, Any]) -> Dict[str, Any]:
        if not self.model:
             raise ValueError("Gemini API key is not configured.")

        prompt = self._load_prompt(metrics)
        
        try:
            response = self.model.generate_content(prompt)
            # Cleanup JSON markdown if present
            text = response.text
            if text.startswith("```json"):
                text = text.replace("```json", "").replace("```", "").strip()
            elif text.startswith("```"):
                 text = text.replace("```", "").strip()
            
            return json.loads(text)
        except Exception as e:
            print(f"Error generating valuation: {e}")
            raise

valuation_service = ValuationService()
