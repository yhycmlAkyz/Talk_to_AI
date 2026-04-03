# 🗣️ Yapay Zeka Destekli İngilizce Pratik Arkadaşı

Bu proje, İngilizce öğrenenlerin konuşma akıcılığını artırmak ve gramer hatalarını düzeltmek amacıyla sıfırdan geliştirilmiş, **gerçek zamanlı, sesli ve web tabanlı** bir yapay zeka uygulamasıdır. 

Sadece bir sohbet botu değil; seni duyan, anlayan, hatalarını Türkçe açıklayarak düzelten ve seninle doğal bir Amerikan aksanıyla konuşan kişisel bir İngilizce öğretmenidir.

## ✨ Temel Özellikler

* **🎙️ Sesli İletişim (Bas-Konuş):** Tarayıcı üzerinden mikrofonla doğrudan sesli İngilizce pratik yapma imkanı.
* **⚡ Işık Hızında Ses Tanıma:** Groq API ve Whisper-Large-V3 modeli sayesinde konuşmaları saniyeler içinde sıfır hatayla metne dökme.
* **🧠 Gelişmiş Yapay Zeka Eğitmeni:** Google Gemini 2.5 Flash modeli ile bağlama uygun, akıcı İngilizce sohbet ve anında gramer düzeltmesi.
* **🔊 Doğal İnsan Sesi:** Microsoft Edge TTS altyapısı kullanılarak yapay zekanın cevaplarını Amerikan aksanlı gerçekçi bir sesle (Aria) anında okuma.
* **💻 Modern Web Arayüzü:** Streamlit kullanılarak tasarlanmış, kullanıcı dostu ve şık sohbet ekranı.
* **🧩 Modüler Mimari:** Temiz kod (Clean Code) prensiplerine uygun olarak farklı işlevlerin (ses, yapay zeka, dinleme, arayüz) ayrı dosyalara bölündüğü profesyonel altyapı.

## 🛠️ Kullanılan Teknolojiler (Tech Stack)

* **Dil:** Python
* **Arayüz:** Streamlit
* **LLM (Dil Modeli):** Google Gemini API (`gemini-2.5-flash`)
* **STT (Sesten Metne):** Groq API (`whisper-large-v3`)
* **TTS (Metinden Sese):** Edge-TTS
* **Ses İşleme:** Sounddevice, Scipy, Numpy, Windows MCI (ctypes)
