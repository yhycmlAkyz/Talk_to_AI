from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
from groq import Groq
import os
import json

load_dotenv()

app = Flask(__name__)
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

SYSTEM_PROMPT = """You are an advanced AI English speaking coach for a Turkish native speaker.

After each user message, respond in this EXACT JSON format (no extra text, no markdown):
{
  "reply": "your conversational reply here",
  "feedback": {
    "hasErrors": true,
    "mistakes": ["mistake 1", "mistake 2"],
    "corrections": ["correction 1", "correction 2"],
    "betterAlternatives": ["alternative 1"],
    "explanation": "brief explanation",
    "fluencyScore": 7
  }
}

If no errors found, set hasErrors to false and leave arrays empty, set fluencyScore 8-10.
Focus on max 2-3 most important mistakes. Keep replies natural and encouraging.
Watch for common Turkish-English errors: missing articles, wrong prepositions, wrong tense."""

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_message = data.get("message", "")
    history = data.get("history", [])
    system_prompt = data.get("systemPrompt", SYSTEM_PROMPT)

    messages = [{"role": "system", "content": system_prompt}] + history + [{"role": "user", "content": user_message}]

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            max_tokens=1024,
            temperature=0.7
        )
    except Exception as e:
        error_msg = str(e)
        if "rate_limit" in error_msg or "429" in error_msg:
            return jsonify({
                "reply": "I need a short break! You've been practicing so much that we've hit today's limit. Come back in a few minutes and we'll continue! 💪",
                "feedback": {"hasErrors": False, "mistakes": [], "corrections": [], "betterAlternatives": [], "explanation": "", "fluencyScore": 0}
            })
        return jsonify({
            "reply": "Something went wrong. Please try again.",
            "feedback": {"hasErrors": False, "mistakes": [], "corrections": [], "betterAlternatives": [], "explanation": "", "fluencyScore": 0}
        })

    raw = response.choices[0].message.content.strip()

    import re
    # Markdown temizle
    raw = re.sub(r'^```(?:json)?\s*', '', raw, flags=re.MULTILINE)
    raw = re.sub(r'```\s*$', '', raw, flags=re.MULTILINE)
    raw = raw.strip()

    # JSON bul (bazen önünde/arkasında gereksiz metin olabiliyor)
    json_match = re.search(r'\{.*\}', raw, re.DOTALL)
    if json_match:
        raw = json_match.group(0)

    try:
        parsed = json.loads(raw)
        if isinstance(parsed.get("reply"), str) and parsed["reply"].strip().startswith("{"):
            try:
                inner = json.loads(parsed["reply"])
                if "reply" in inner:
                    parsed = inner
            except:
                pass
    except:
        parsed = {
            "reply": raw,
            "feedback": {
                "hasErrors": False,
                "mistakes": [],
                "corrections": [],
                "betterAlternatives": [],
                "explanation": "",
                "fluencyScore": 7
            }
        }

    return jsonify(parsed)

@app.route("/speak", methods=["POST"])
def speak_text():
    data = request.get_json()
    text = data.get("text", "")

    ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
    VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID")

    import requests
    response = requests.post(
        f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}",
        headers={
            "xi-api-key": ELEVENLABS_API_KEY,
            "Content-Type": "application/json"
        },
        json={
            "text": text,
            "model_id": "eleven_turbo_v2_5",
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.75
            }
        }
    )

    if response.status_code == 200:
        import base64
        audio_base64 = base64.b64encode(response.content).decode("utf-8")
        return jsonify({"audio": audio_base64})
    else:
        return jsonify({"error": "TTS failed", "status": response.status_code, "detail": response.text}), 500

if __name__ == "__main__":
    app.run(debug=True)