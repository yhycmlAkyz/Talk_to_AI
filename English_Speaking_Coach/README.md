# 🎙️ AI English Speaking Coach

An AI-powered English speaking coach built with Python, Flask, and modern web technologies. Designed specifically for Turkish speakers to improve their English fluency through real-time conversation, feedback, and role-play scenarios.

## ✨ Features

- **Real-time AI Conversation** — Powered by Groq API (Llama 3.3 70B)
- **Instant Grammar Feedback** — Detects and corrects mistakes after each message
- **Speech Recognition** — Practice speaking with your microphone (Chrome)
- **Text-to-Speech** — Natural voice responses via ElevenLabs API
- **4 Learning Modes** — Normal, Practice, Strict, Exam (IELTS/TOEFL style)
- **16 Role-play Scenarios** — Job interview, restaurant, airport, doctor and more
- **Vocabulary Book** — Automatically saves your mistakes and corrections
- **Speaking Challenges** — Mini challenges every 5 turns to push your limits
- **Session History** — Conversations saved locally, pick up where you left off
- **Fluency Score** — Real-time scoring and perfect streak tracking

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python, Flask |
| AI Model | Groq API (Llama 3.3 70B) |
| Text-to-Speech | ElevenLabs API |
| Speech Recognition | Web Speech API |
| Frontend | HTML, CSS, JavaScript |
| Storage | localStorage |

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Groq API key (free) — [console.groq.com](https://console.groq.com)
- ElevenLabs API key (free tier) — [elevenlabs.io](https://elevenlabs.io)

### Installation

1. Clone the repository
```bash
git clone https://github.com/KULLANICI_ADIN/english-speaking-coach.git
cd english-speaking-coach
```

2. Create and activate virtual environment
```bash
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux
```

3. Install dependencies
```bash
pip install -r requirements.txt
```

4. Create `.env` file
GROQ_API_KEY=your_groq_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_VOICE_ID=your_voice_id

5. Run the app
```bash
python app.py
```

6. Open your browser at `http://127.0.0.1:5000`

> 💡 Use **Google Chrome** for microphone and speech recognition support.

## 📁 Project Structure

english-coach/
├── app.py              # Flask backend
├── requirements.txt    # Dependencies
├── .env                # API keys (not committed)
├── templates/
│   └── index.html      # Main HTML
└── static/
├── style.css       # Styles
└── script.js       # Frontend logic

## 🎯 Usage

1. Click **Start Session** to begin
2. Choose a **Scenario** (optional) for role-play practice
3. Type or use the **microphone** to speak
4. Receive instant **feedback** on your grammar and vocabulary
5. Track your progress with **Fluency Score** and **Perfect Streak**
6. Review saved mistakes in the **Vocabulary Book**

## 📄 License

MIT License — feel free to use and modify.