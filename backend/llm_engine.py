"""
llm_engine.py — Groq LLM integration for knee rehab assistant
"""

import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

SYSTEM_PROMPT = """
You are KneeAssist — an AI assistant specialized ONLY in post-operative knee rehabilitation.

Rules:
- Only answer questions related to post-operative knee care, exercises, recovery timelines, pain management (non-pharmacological), physiotherapy, and wound care.
- If the question is unrelated, respond: "I can only assist with post-operative knee rehabilitation queries."
- Do NOT prescribe medicines or dosages.
- Do NOT give medical diagnoses.
- Always recommend consulting their surgeon or physiotherapist for personalized advice.
- Keep responses clear, empathetic, and concise (2-4 sentences max unless more detail is truly needed).
- Use simple, patient-friendly language.
"""


def generate_llm_response(user_text: str) -> str:
    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_text},
            ],
            temperature=0.3,
            max_tokens=300,
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"I'm having trouble connecting right now. Please try again shortly."