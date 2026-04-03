import requests

URL_SABLON = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key="

def baslangic_gecmisi_olustur():
    """Yapay zekanın karakterini belirten gizli ilk mesajı hazırlar."""
    sistem_komutu = """
    Sen benim İngilizce pratik arkadaşımsın. Ben Türkçe ve İngilizceyi karışık kullanabilirim. 
    Eğer İngilizce bir cümlede temel bir gramer hatası yaparsam, beni kısaca Türkçe uyar ama 
    sohbeti her zaman İngilizce sürdürerek bana bir soru sor.
    """
    return [
        {"role": "user", "parts": [{"text": f"Lütfen şu kurallara göre davran: {sistem_komutu}"}]},
        {"role": "model", "parts": [{"text": "Anladım! Kurallara harfiyen uyacağım. Harika bir İngilizce pratik arkadaşı olacağım."}]}
    ]

def mesaj_gonder(kullanici_mesaji, gecmis, api_key):
    """Mesajı Google'a iletir ve cevabı döndürür."""
    url = URL_SABLON + api_key
    
    gecmis.append({"role": "user", "parts": [{"text": kullanici_mesaji}]})
    
    paket = {"contents": gecmis}
    response = requests.post(url, headers={'Content-Type': 'application/json'}, json=paket)
    
    if response.status_code == 200:
        cevap_json = response.json()
        try:
            ai_cevabi = cevap_json['candidates'][0]['content']['parts'][0]['text']

            gecmis.append({"role": "model", "parts": [{"text": ai_cevabi}]})
            return True, ai_cevabi
        except KeyError:
            gecmis.pop()
            return False, "Yapay zeka bir cevap üretemedi."
    else:
        gecmis.pop()
        hata_mesaji = f"Hata Kodu: {response.status_code}\nGoogle'ın Hata Mesajı: {response.text}"
        return False, hata_mesaji