import sounddevice as sd
import numpy as np
from scipy.io.wavfile import write
from groq import Groq
import os

GROQ_API_KEY = "groq_api_key"
client = Groq(api_key=GROQ_API_KEY)

def mikrofonu_dinle(dosya_adi="sesim.wav"):
    """Mikrofondan sesi kaydeder (Bas-Konuş mantığıyla çalışır)."""
    fs = 44100
    ses_verisi = []
    
    def callback(indata, frames, time, status):
        ses_verisi.append(indata.copy())
        
    input("\n🎤 Konuşmaya başlamak için ENTER'a bas...")
    print("🔴 Dinleniyor... (Konuşman bitince tekrar ENTER'a bas)")
    
    stream = sd.InputStream(samplerate=fs, channels=1, callback=callback)
    with stream:
        input()
        
    print("✅ Ses alındı, metne çevriliyor...")
    
    tam_ses = np.concatenate(ses_verisi, axis=0)
    write(dosya_adi, fs, tam_ses)
    
    return dosya_adi

def sesten_metne(dosya_adi="sesim.wav"):
    """Kaydedilen sesi Groq (Whisper) ile metne çevirir."""
    with open(dosya_adi, "rb") as file:
        transcription = client.audio.transcriptions.create(
          file=(dosya_adi, file.read()),
          model="whisper-large-v3",

        )
    
    if os.path.exists(dosya_adi):
        os.remove(dosya_adi)
        
    return transcription.text