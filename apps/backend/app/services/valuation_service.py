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
        else:
            print("WARNING: GEMINI_API_KEY not set. Valuation service will not work.")

        # Updated to use valid models found in environment
        self.models = ['gemini-2.0-flash', 'gemini-flash-latest', 'gemini-pro-latest']
        self.prompt_template_path = Path(__file__).parent.parent / "prompts" / "valuation.txt"

    def _load_prompt(self, metrics: Dict[str, Any]) -> str:
        if not self.prompt_template_path.exists():
            raise FileNotFoundError(f"Prompt template not found at {self.prompt_template_path}")
        
        with open(self.prompt_template_path, "r") as f:
            template_content = f.read()
        
        template = Template(template_content)
        return template.render(**metrics)

    async def generate_valuation(self, metrics: Dict[str, Any]) -> Dict[str, Any]:
        if not settings.gemini_api_key:
             raise ValueError("Gemini API key is not configured.")

        if metrics.get('growth_rate') is None and metrics.get('revenue_trend'):
             metrics['growth_description'] = f"The revenue trend is described as: {metrics['revenue_trend']}"
        elif metrics.get('growth_rate') is not None:
             metrics['growth_description'] = f"Year-over-Year Growth Rate: {metrics['growth_rate'] * 100}%"
        else:
             metrics['growth_description'] = "Growth data not provided."

        prompt = self._load_prompt(metrics)
        
        last_exception = None

        for model_name in self.models:
            try:
                print(f"Attempting valuation with model: {model_name}")
                model = genai.GenerativeModel(model_name)
                response = model.generate_content(prompt)
                
                # Cleanup JSON markdown if present
                text = response.text
                if text.startswith("```json"):
                    text = text.replace("```json", "").replace("```", "").strip()
                elif text.startswith("```"):
                     text = text.replace("```", "").strip()
                
                return json.loads(text)
            except Exception as e:
                print(f"Error generating valuation with {model_name}: {e}")
                last_exception = e
                continue
        
        # If we get here, all models failed
        if last_exception:
            raise last_exception
        else:
            raise Exception("Valuation generation failed for all models")

valuation_service = ValuationService()
