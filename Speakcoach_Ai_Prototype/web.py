import streamlit as st
import yapay_zeka
import ses
import kulak

st.set_page_config(page_title="İngilizce Pratik Arkadaşım", page_icon="🗣️")
st.title("🗣️ İngilizce Pratik Arkadaşım")
st.write("Aşağıdaki mikrofona tıklayarak konuşabilir veya kutuya yazabilirsin.")

if "gecmis" not in st.session_state:
    st.session_state.gecmis = yapay_zeka.baslangic_gecmisi_olustur()

for mesaj in st.session_state.gecmis[2:]:
    rol = "user" if mesaj["role"] == "user" else "assistant"
    with st.chat_message(rol):
        st.write(mesaj["parts"][0]["text"])

kullanici_mesaji = st.chat_input("İngilizce bir şeyler yaz...")
ses_verisi = st.audio_input("🎤 Konuşmak için tıkla")

metin = None

if ses_verisi:
    with open("web_ses.wav", "wb") as f:
        f.write(ses_verisi.getbuffer())
    
    with st.spinner("Söylediklerin anlaşılıyor..."):
        metin = kulak.sesten_metne("web_ses.wav")

elif kullanici_mesaji:
    metin = kullanici_mesaji

if metin:
    with st.chat_message("user"):
        st.write(metin)
    
    API_KEY = "GOOGLE_API_KEY"
    
    with st.spinner("Öğretmen cevap yazıyor..."):
        basarili_mi, cevap = yapay_zeka.mesaj_gonder(metin, st.session_state.gecmis, API_KEY)
    
    if basarili_mi:
        with st.chat_message("assistant"):
            st.write(cevap)
            
        ses.sesli_oku(cevap)
        
        st.rerun()
    else:
        st.error("Bir hata oluştu: " + cevap)