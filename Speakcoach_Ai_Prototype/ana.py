import yapay_zeka
import ses
import kulak

API_KEY = "GOOGLE_API_KEY"

print("-" * 50)
print("Sistem başlatılıyor...")

gecmis = yapay_zeka.baslangic_gecmisi_olustur()

print("İngilizce Pratik Arkadaşın hazır!")
print("-" * 50)

ses.sesli_oku("Hello! I am ready to practice. Press Enter when you want to speak.")

while True:
    kaydedilen_dosya = kulak.mikrofonu_dinle()
    
    kullanici_mesaji = kulak.sesten_metne(kaydedilen_dosya)
    
    print(f"\nSenin Söylediğin: {kullanici_mesaji}")
    print("-" * 50)
    
    if kullanici_mesaji.strip() == "":
        continue
    if kullanici_mesaji.lower().strip() in ['q', 'quit', 'exit', 'çıkış', 'kapat']:
        print("Görüşmek üzere!")
        ses.sesli_oku("Goodbye! See you later.")
        break
        
    basarili_mi, cevap = yapay_zeka.mesaj_gonder(kullanici_mesaji, gecmis, API_KEY)
    
    if basarili_mi:
        print(f"Yapay Zeka: {cevap}")
        print("-" * 50)
        
        ses.sesli_oku(cevap)
    else:
        print("\n--- BİR HATA OLUŞTU ---")
        print(cevap)
        print("-----------------------\n")