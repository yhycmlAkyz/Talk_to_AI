import subprocess
import os
import ctypes

def sesli_oku(metin, dosya_adi="cevap.mp3"):
    """Verilen metni sese dönüştürür ve Windows ses motoruyla çalar."""
    
    subprocess.run(
        ['edge-tts', '--voice', 'en-US-AriaNeural', '--text', metin, '--write-media', dosya_adi], 
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
    )
    
    alias = "ses_dosyasi"
    mci = ctypes.windll.winmm.mciSendStringW
    
    mci(f'open "{dosya_adi}" type mpegvideo alias {alias}', None, 0, None)
    mci(f'play {alias} wait', None, 0, None)
    mci(f'close {alias}', None, 0, None)
    
    if os.path.exists(dosya_adi):
        os.remove(dosya_adi)