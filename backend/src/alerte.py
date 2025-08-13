from fastapi import APIRouter
import requests
import xml.etree.ElementTree as ET
from googletrans import Translator
from datetime import datetime, timezone
import re

router = APIRouter()  # 🔄 au lieu de FastAPI()

translator = Translator()

def traduire_texte(texte: str) -> str:
    try:
        return translator.translate(texte, dest='fr').text if texte else ''
    except Exception as e:
        print("Erreur traduction:", e)
        return texte or ''

def extraire_dates(desc: str):
    pattern = r"(\d{2}/\d{2}/\d{4})"
    found = re.findall(pattern, desc)
    if len(found) >= 2:
        from_date = datetime.strptime(found[0], '%d/%m/%Y').replace(tzinfo=timezone.utc)
        to_date = datetime.strptime(found[1], '%d/%m/%Y').replace(tzinfo=timezone.utc)
        return from_date, to_date, None
    elif len(found) == 1:
        event_date = datetime.strptime(found[0], '%d/%m/%Y').replace(tzinfo=timezone.utc)
        return None, None, event_date
    return None, None, None

def detecter_statut_depuis_phrase(texte: str) -> str:
    t = texte.lower()
    mots_futurs = [
        "en train de", "en allant", "se déplace", "va", "sera", "prévu", "prévision",
        "expected", "forecast", "will affect", "projected to", "is moving toward", "expected landfall"
    ]
    mots_present = ["en cours", "est", "currently"]
    mots_passe = ["était", "avait", "was", "had"]

    if any(m in t for m in mots_futurs):
        return 'futures'
    elif any(m in t for m in mots_present):
        return 'presentes'
    elif any(m in t for m in mots_passe):
        return 'passees'
    return 'presentes'

@router.get("/alerts")  # 🔄 route sans "/api", car on ajoute le prefix dans main.py
def get_alerts():
    try:
        url = 'http://www.gdacs.org/xml/rss.xml'
        resp = requests.get(url)
        if resp.status_code != 200:
            return {"error": f"Erreur récupération : {resp.status_code}"}

        xml_content = resp.content.decode('utf-8-sig')
        root = ET.fromstring(xml_content)

        now = datetime.now(timezone.utc)
        presentes, futures, passees = [], [], []
        alertes_all = []

        for item in root.findall(".//item"):
            title_raw = item.findtext("title") or ''
            desc_raw = item.findtext("description") or ''

            description = traduire_texte(desc_raw)
            link = item.findtext("link")
            country = item.findtext("{http://www.gdacs.org}country")
            severity = item.findtext("{http://www.gdacs.org}severity")
            alert_level = item.findtext("{http://www.gdacs.org}alertlevel")
            georss = item.findtext("{http://www.georss.org/georss}point")
            lat, lon = (georss.split() if georss else (None, None))

            from_date, to_date, event_date = extraire_dates(desc_raw)

            if from_date and to_date:
                if from_date.date() <= now.date() <= to_date.date():
                    statut = 'presentes'
                elif from_date.date() > now.date():
                    statut = 'futures'
                else:
                    statut = 'passees'
            elif event_date:
                if event_date > now:
                    statut = 'futures'
                elif event_date.date() == now.date():
                    statut = 'presentes'
                else:
                    statut = 'passees'
            else:
                statut = detecter_statut_depuis_phrase(description)

            alerte = {
                'title': traduire_texte(title_raw),
                'description': description,
                'link': link,
                'country': country,
                'severity': severity,
                'latitude': lat,
                'longitude': lon,
                'alert_level': alert_level,
                'statut': statut
            }

            alertes_all.append(alerte)
            if statut == 'presentes':
                presentes.append(alerte)
            elif statut == 'futures':
                futures.append(alerte)
            else:
                passees.append(alerte)

        return {
            'all': alertes_all,
            'presentes': presentes,
            'futures': futures,
            'passees': passees
        }

    except Exception as e:
        print("Erreur principale:", e)
        return {"error": f"Erreur interne: {e}"}
