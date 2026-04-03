let currentAudio = null;
let history = [];
let turns = 0;
let totalErrors = 0;
let scores = [];
let streak = 0;
let recognition = null;
let isRecording = false;
let voiceEnabled = true;
let currentMode = 'normal';
let vocabList = [];
let currentChallenge = null;
let challengeCompleted = 0;
let usedChallenges = [];
let activeScenario = null;

const modePrompts = {
  normal:   "Give balanced feedback — not too strict, not too lenient. Be encouraging.",
  practice: "Focus mainly on conversation. Only note very major errors briefly.",
  strict:   "Correct every single grammar, vocabulary, and usage mistake you find.",
  exam:     "Simulate an IELTS speaking examiner. Give band score estimates and examiner-style feedback."
};

const scenarioPrompts = {
  job_interview:        { label: "Job Interview",        prompt: "You are a professional interviewer at a top tech company. You are interviewing the user for a software/data position. Ask typical interview questions one by one. Be professional but friendly. Evaluate their English as well as their answers." },
  business_meeting:     { label: "Business Meeting",     prompt: "You are a colleague in a business meeting. Discuss a fictional project plan with the user. Use professional business English. Encourage them to share ideas, agree/disagree, and present their thoughts." },
  email_call:           { label: "Phone Call",           prompt: "You are a professional on a phone call with the user. Simulate a business phone conversation — scheduling a meeting, discussing a problem, or following up on a project." },
  negotiation:          { label: "Negotiation",          prompt: "You are an employer and the user wants to negotiate their salary. Be firm but fair. Use negotiation language and encourage the user to use persuasive English phrases." },
  airport:              { label: "Airport",              prompt: "You are an airport staff member (check-in, customs, or boarding gate). Help the user practice airport English — checking in, asking about baggage, going through customs, boarding." },
  hotel:                { label: "Hotel Check-in",       prompt: "You are a hotel receptionist. The user is checking in. Practice hotel vocabulary — reservation, room types, amenities, complaints, requests." },
  tourist:              { label: "Asking Directions",    prompt: "You are a local in an English-speaking city. The user is a tourist asking for directions. Use real directional language — turn left, go straight, it's next to, etc." },
  travel_emergency:     { label: "Travel Emergency",     prompt: "You are an airport/embassy staff member. The user has a travel emergency — lost passport, missed flight, or medical issue. Help them practice emergency English." },
  restaurant:           { label: "Restaurant",           prompt: "You are a waiter at a nice restaurant. Take the user's order, answer questions about the menu, handle special requests and complaints. Use restaurant vocabulary." },
  shopping:             { label: "Shopping",             prompt: "You are a shop assistant in a clothing or electronics store. Help the user practice shopping English — asking for sizes, comparing products, handling returns." },
  doctor:               { label: "Doctor's Appointment", prompt: "You are a doctor. The user is your patient. Ask about their symptoms, give advice, prescribe medication. Help them practice medical English vocabulary." },
  small_talk:           { label: "Small Talk",           prompt: "You are a friendly native English speaker making small talk with the user — at a party, on a train, or at a coffee shop. Keep it casual and natural." },
  presentation:         { label: "Presentation",         prompt: "You are an audience member and evaluator. The user will give a short presentation on any topic they choose. Ask follow-up questions, give feedback on their presentation English." },
  debate:               { label: "Debate",               prompt: "You will debate with the user on a topic of their choice. Take the opposing side. Use debate language." },
  university_interview: { label: "University Interview", prompt: "You are a university admissions officer interviewing the user. Ask about their background, motivations, goals, and strengths. Be formal and thorough." },
  free_chat:            { label: "Free Chat",            prompt: "You are a friendly English speaking coach. Have a natural conversation with the user on any topic they like." }
};

const challenges = [
  { text: "Describe your bedroom in 3 sentences.", hint: "Think about: size, furniture, colors." },
  { text: "Tell me about your last vacation or a place you want to visit.", hint: "Use past tense: went, saw, ate..." },
  { text: "What do you usually do on weekends? Give details.", hint: "Use: I usually / I often / Sometimes I..." },
  { text: "Describe your best friend without saying their name.", hint: "Think about: appearance, personality, hobbies." },
  { text: "Tell me about a movie or TV show you recently watched.", hint: "Use: It was about... / I liked it because..." },
  { text: "What are your goals for the next 6 months?", hint: "Use: I want to / I'm planning to / I hope to..." },
  { text: "Describe a typical day in your life.", hint: "Use: First... Then... After that... Finally..." },
  { text: "What is your favourite food and how is it made?", hint: "Use: You need... First you... Then you..." },
  { text: "Talk about a challenge you faced recently and how you handled it.", hint: "Use: I had to... I decided to... In the end..." },
  { text: "If you could travel anywhere tomorrow, where would you go and why?", hint: "Use: I would go to... because... I'd love to see..." }
];

// --- System Prompt ---
function getSystemPrompt() {
  const scenarioInstruction = activeScenario
    ? `\nCURRENT SCENARIO: ${activeScenario.prompt}\nStay in character throughout the conversation while still giving English feedback.`
    : "";
  return `You are an advanced AI English speaking coach for a Turkish native speaker.
Mode: ${currentMode.toUpperCase()}. ${modePrompts[currentMode]}${scenarioInstruction}

Common Turkish-English errors to watch for: missing articles (a/the), wrong prepositions, direct translations from Turkish, subject-verb agreement, wrong tense, missing auxiliary verbs.

Respond ONLY in this exact JSON format (no markdown, no code blocks, no extra text):
{"reply":"your conversational reply","feedback":{"hasErrors":true,"mistakes":["mistake1"],"corrections":["fix1"],"betterAlternatives":["alt1"],"explanation":"short note","fluencyScore":7}}

If no errors: {"reply":"...","feedback":{"hasErrors":false,"mistakes":[],"corrections":[],"betterAlternatives":[],"explanation":"Great job!","fluencyScore":9}}`;
}

// --- Session Storage ---
function saveSession() {
  localStorage.setItem("coach_session", JSON.stringify({ history, turns, totalErrors, scores, streak, savedAt: new Date().toISOString() }));
}

function loadSession() {
  try {
    const raw = localStorage.getItem("coach_session");
    if (!raw) return false;
    const s = JSON.parse(raw);
    history = s.history || [];
    turns = s.turns || 0;
    totalErrors = s.totalErrors || 0;
    scores = s.scores || [];
    streak = s.streak || 0;
    return true;
  } catch(e) { return false; }
}

function updateStatDisplay() {
  document.getElementById("s-turns").textContent  = turns;
  document.getElementById("s-errors").textContent = totalErrors;
  document.getElementById("s-streak").textContent = streak;
  if (scores.length > 0) {
    const avg = (scores.reduce((a,b) => a+b, 0) / scores.length).toFixed(1);
    document.getElementById("s-score").textContent = avg + "/10";
  } else {
    document.getElementById("s-score").textContent = "—";
  }
}

function clearSession() {
  localStorage.removeItem("coach_session");
  localStorage.removeItem("coach_challenges");
  localStorage.removeItem("coach_vocab");
  history = []; turns = 0; totalErrors = 0; scores = []; streak = 0;
  challengeCompleted = 0; usedChallenges = []; currentChallenge = null;
  vocabList = [];
  document.getElementById("challenge-card").style.display = "none";
  updateVocabUI();
  updateStatDisplay();
  document.getElementById("chat-box").innerHTML = `
    <div id="start-screen" style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:16px;">
      <div style="font-size:48px;">🎙️</div>
      <div style="text-align:center;">
        <p style="font-size:18px;font-weight:600;color:#fff;">Ready to practice?</p>
        <p style="font-size:13px;color:#555;margin-top:4px;">Your AI English coach is waiting for you.</p>
      </div>
      <button onclick="startSession()" style="padding:12px 32px;background:#6c63ff;color:white;border:none;border-radius:24px;font-size:15px;font-weight:500;cursor:pointer;">Start Session</button>
    </div>`;
}

function restoreChatUI() {
  const box = document.getElementById("chat-box");
  box.innerHTML = "";
  for (let i = 0; i < history.length; i++) {
    const msg = history[i];
    if (msg.role === "user") {
      const div = document.createElement("div");
      div.className = "msg user";
      div.innerHTML = `<div class="bubble">${msg.content}</div>`;
      box.appendChild(div);
    } else if (msg.role === "assistant") {
      try {
        const parsed = JSON.parse(msg.content);
        const div = document.createElement("div");
        div.className = "msg coach";
        div.innerHTML = `<div class="bubble">${parsed.reply}</div>`;
        box.appendChild(div);
        if (parsed.feedback && parsed.feedback.hasErrors) addFeedback(parsed.feedback);
      } catch(e) {}
    }
  }
  box.scrollTop = box.scrollHeight;
}

// --- UI Helpers ---
function startSession() {
  document.getElementById("start-screen").remove();
  const greeting = "Hello, I'm your English speaking coach. I'm here to help you improve your English skills in a supportive and encouraging environment. How are you doing today?";
  addMsg("coach", greeting);
}

function addMsg(role, text) {
  const box = document.getElementById("chat-box");
  const div = document.createElement("div");
  div.className = "msg " + role;
  let displayText = text;
  if (role === "coach") {
    try {
      const parsed = JSON.parse(text);
      if (parsed.reply) displayText = parsed.reply;
    } catch(e) {}
  }
  div.innerHTML = `<div class="bubble">${displayText.replace(/\n/g, "<br>")}</div>`;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
  if (role === "coach" && voiceEnabled) speak(displayText);
}

function addFeedback(fb) {
  addToVocab(fb.mistakes, fb.corrections);
  if (!fb.hasErrors) return;
  const box = document.getElementById("chat-box");
  const div = document.createElement("div");
  div.className = "feedback";
  let html = "";
  if (fb.mistakes.length > 0) {
    html += `<div class="feedback-title">Mistakes</div>` + fb.mistakes.map(m => `<span class="tag tag-bad">${m}</span>`).join("");
    html += `<div class="feedback-title">Corrections</div>` + fb.corrections.map(c => `<span class="tag tag-good">${c}</span>`).join("");
  }
  if (fb.betterAlternatives && fb.betterAlternatives.length > 0)
    html += `<div class="feedback-title">Better phrasing</div>` + fb.betterAlternatives.map(a => `<span class="tag tag-good">${a}</span>`).join("");
  if (fb.explanation)
    html += `<div class="feedback-note">${fb.explanation}</div>`;
  div.innerHTML = html;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

function showTyping() {
  const box = document.getElementById("chat-box");
  const div = document.createElement("div");
  div.className = "msg coach";
  div.id = "typing";
  div.innerHTML = `<div class="typing-bubble"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>`;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

function removeTyping() {
  const t = document.getElementById("typing");
  if (t) t.remove();
}

function updateStats(fb) {
  turns++;
  document.getElementById("s-turns").textContent = turns;
  if (fb.hasErrors) {
    totalErrors += fb.mistakes.length;
    document.getElementById("s-errors").textContent = totalErrors;
    streak = 0;
  } else {
    streak++;
  }
  document.getElementById("s-streak").textContent = streak;
  if (fb.fluencyScore) {
    scores.push(fb.fluencyScore);
    const avg = (scores.reduce((a,b) => a+b, 0) / scores.length).toFixed(1);
    document.getElementById("s-score").textContent = avg + "/10";
  }
  if (turns % 5 === 0) showChallenge();
  saveSession();
}

function setMode(m) {
  currentMode = m;
  document.querySelectorAll(".mode-pill").forEach(p => p.classList.remove("active"));
  document.getElementById("pill-" + m).classList.add("active");
  const names = { normal: "Normal", practice: "Practice mode", strict: "Strict mode", exam: "Exam mode" };
  addMsg("coach", `Switched to ${names[m]}. Let's continue! 💪`);
}

// --- API ---
async function sendToAPI(text) {
  const isChallenge = text.startsWith("[CHALLENGE]");
  const isScenario  = text.startsWith("[SCENARIO START]");
  const isHidden    = isChallenge || isScenario;

  if (!isHidden) {
    const box = document.getElementById("chat-box");
    const div = document.createElement("div");
    div.className = "msg user";
    div.innerHTML = `<div class="bubble">${text}</div>`;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
  }

  showTyping();
  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, history, systemPrompt: getSystemPrompt() })
    });
    const data = await res.json();
    removeTyping();

    if (!isHidden) history.push({ role: "user", content: text });
    else if (isChallenge) history.push({ role: "user", content: "[Speaking Challenge accepted]" });
    else if (isScenario)  history.push({ role: "user", content: "[Scenario started]" });

    history.push({ role: "assistant", content: JSON.stringify(data) });
    addMsg("coach", JSON.stringify(data));

    if (data.feedback) {
      addFeedback(data.feedback);
      updateStats(data.feedback);
    }

    if (currentChallenge && isChallenge) completeChallenge();

  } catch(e) {
    removeTyping();
    addMsg("coach", "Something went wrong. Please try again.");
  }
}

function sendMessage() {
  const input = document.getElementById("user-input");
  const text = input.value.trim();
  if (!text) return;
  input.value = "";
  input.style.height = "auto";
  sendToAPI(text);
}

// --- Voice Output ---
async function speak(text) {
  if (!voiceEnabled) return;
  if (currentAudio) { currentAudio.pause(); currentAudio = null; }

  const cleaned = text.replace(/[\u{1F000}-\u{1FFFF}]/gu, '')
                      .replace(/[\u2600-\u27BF]/g, '')
                      .replace(/\s+/g, ' ').trim();
  if (!cleaned) return;

  // ElevenLabs'ı dene, başarısız olursa Web Speech'e geç
  try {
    const res = await fetch("/speak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: cleaned })
    });
    const data = await res.json();
    if (data.audio) {
      currentAudio = new Audio("data:audio/mpeg;base64," + data.audio);
      currentAudio.play();
      return;
    }
  } catch(e) {}

  // Fallback: Web Speech API
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(cleaned);
    utterance.lang = "en-US";
    utterance.rate = 0.95;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.lang.startsWith("en") && v.name.includes("Google"))
                   || voices.find(v => v.lang.startsWith("en"));
    if (preferred) utterance.voice = preferred;
    window.speechSynthesis.speak(utterance);
  }
}

function toggleVoice() {
  voiceEnabled = !voiceEnabled;
  const btn = document.getElementById("voice-btn");
  btn.classList.toggle("voice-on", voiceEnabled);
  btn.textContent = voiceEnabled ? "🔊" : "🔇";
  if (!voiceEnabled && currentAudio) { currentAudio.pause(); currentAudio = null; }
}

// --- Mic ---
function toggleMic() {
  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    alert("Please use Google Chrome for microphone support.");
    return;
  }
  if (isRecording) { recognition.stop(); return; }
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SR();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.onstart = () => { isRecording = true; document.getElementById("mic-btn").classList.add("active"); };
  recognition.onresult = e => { document.getElementById("user-input").value = e.results[0][0].transcript; };
  recognition.onend = () => { isRecording = false; document.getElementById("mic-btn").classList.remove("active"); };
  recognition.start();
}

// --- Vocabulary ---
function loadVocab() {
  try {
    const raw = localStorage.getItem("coach_vocab");
    if (raw) vocabList = JSON.parse(raw);
    updateVocabUI();
  } catch(e) {}
}

function saveVocab() {
  localStorage.setItem("coach_vocab", JSON.stringify(vocabList));
}

function addToVocab(mistakes, corrections) {
  if (!mistakes || mistakes.length === 0) return;
  mistakes.forEach((mistake, i) => {
    const correction = corrections[i] || "";
    if (!vocabList.find(v => v.wrong === mistake)) {
      vocabList.unshift({ wrong: mistake, correct: correction, date: new Date().toLocaleDateString("en-GB") });
    }
  });
  saveVocab();
  updateVocabUI();
}

function updateVocabUI() {
  const count = vocabList.length;
  const countEl  = document.getElementById("vocab-count");
  const subtitle = document.getElementById("vocab-subtitle");
  const list     = document.getElementById("vocab-list");
  if (subtitle) subtitle.textContent = `${count} word${count !== 1 ? "s" : ""} saved`;
  if (countEl)  { countEl.textContent = count; countEl.style.display = count > 0 ? "inline" : "none"; }
  if (!list) return;
  if (count === 0) { list.innerHTML = `<div id="vocab-empty">No words saved yet.<br>Start practicing to build your vocabulary!</div>`; return; }
  list.innerHTML = vocabList.map(v => `
    <div class="vocab-card">
      <div class="vocab-word">${v.correct}</div>
      <div class="vocab-wrong">✗ ${v.wrong}</div>
      <div class="vocab-correct">✓ ${v.correct}</div>
      <div class="vocab-date">${v.date}</div>
    </div>`).join("");
}

function toggleVocab() {
  document.getElementById("vocab-panel").classList.toggle("open");
  document.getElementById("vocab-overlay").classList.toggle("open");
}

// --- Challenges ---
function loadChallengeState() {
  try {
    const raw = localStorage.getItem("coach_challenges");
    if (raw) { const s = JSON.parse(raw); challengeCompleted = s.completed || 0; usedChallenges = s.used || []; }
  } catch(e) {}
}

function saveChallengeState() {
  localStorage.setItem("coach_challenges", JSON.stringify({ completed: challengeCompleted, used: usedChallenges }));
}

function getRandomChallenge() {
  const unused = challenges.filter((_, i) => !usedChallenges.includes(i));
  if (unused.length === 0) { usedChallenges = []; return challenges[0]; }
  const idx = Math.floor(Math.random() * unused.length);
  const originalIdx = challenges.indexOf(unused[idx]);
  usedChallenges.push(originalIdx);
  return unused[idx];
}

function showChallenge() {
  currentChallenge = getRandomChallenge();
  const card = document.getElementById("challenge-card");
  document.getElementById("challenge-text").textContent = currentChallenge.text;
  document.getElementById("challenge-hint").textContent = "💡 " + currentChallenge.hint;
  document.getElementById("challenge-progress").textContent = `Completed: ${challengeCompleted}`;
  card.style.display = "flex";
  saveChallengeState();

  if (window.challengeTimer) { clearTimeout(window.challengeTimer); window.challengeTimer = null; }

  const fill = document.getElementById("challenge-timer-fill");
  fill.style.transition = "none";
  fill.style.width = "100%";
  requestAnimationFrame(() => requestAnimationFrame(() => {
    fill.style.transition = "width 10s linear";
    fill.style.width = "0%";
  }));

  window.challengeTimer = setTimeout(() => { window.challengeTimer = null; skipChallenge(); }, 10000);
}

function skipChallenge() {
  document.getElementById("challenge-card").style.display = "none";
  currentChallenge = null;
  if (window.challengeTimer) { clearTimeout(window.challengeTimer); window.challengeTimer = null; }
}

function acceptChallenge() {
  if (!currentChallenge) return;
  document.getElementById("challenge-card").style.display = "none";
  const prompt = `[CHALLENGE] The user accepted a speaking challenge. Ask them the following as your next question and evaluate their response carefully: "${currentChallenge.text}" — Hint for evaluation: ${currentChallenge.hint}`;
  sendToAPI(prompt);
}

function completeChallenge() {
  if (!currentChallenge) return;
  challengeCompleted++;
  currentChallenge = null;
  saveChallengeState();
}

// --- Scenarios ---
function openScenario()  { document.getElementById("scenario-overlay").classList.add("open"); }
function closeScenario() { document.getElementById("scenario-overlay").classList.remove("open"); }

function handleOverlayClick(e) {
  if (e.target === document.getElementById("scenario-overlay")) closeScenario();
}

function selectScenario(key) {
  const scenario = scenarioPrompts[key];
  if (!scenario) return;
  activeScenario = { key, ...scenario };
  closeScenario();
  const badge = document.getElementById("active-scenario");
  badge.textContent = "🎭 " + scenario.label;
  badge.style.display = "inline";
  history = []; turns = 0; totalErrors = 0; scores = []; streak = 0;
  document.getElementById("chat-box").innerHTML = "";
  updateStatDisplay();
  saveSession();
  sendToAPI(`[SCENARIO START] You are now role-playing the following scenario: ${scenario.prompt} Start the conversation naturally in character. Keep your opening short — 2-3 sentences max.`);
}

// --- Init ---
window.onload = () => {
  document.getElementById("voice-btn").classList.add("voice-on");
  loadVocab();
  loadChallengeState();
  const loaded = loadSession();
  if (loaded && history.length > 0) {
    updateStatDisplay();
    restoreChatUI();
  }

  document.getElementById("user-input").addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });

  document.getElementById("user-input").addEventListener("input", function() {
    this.style.height = "auto";
    this.style.height = Math.min(this.scrollHeight, 80) + "px";
  });

  document.getElementById("challenge-skip").addEventListener("click", function(e) {
    e.stopPropagation();
    skipChallenge();
  });
};