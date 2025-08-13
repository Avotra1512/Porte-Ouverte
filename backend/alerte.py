# alerte.py
from fastapi import APIRouter
import requests
import xml.etree.ElementTree as ET
from googletrans import Translator
from datetime import datetime, timezone
from cachetools import TTLCache
import re
from functools import lru_cache

router = APIRouter()
translator = Translator()
cache = TTLCache(maxsize=1, ttl=30)

traductions_manuelles = {
    "Italy": "Italie",
    "France": "France",
    "Germany": "Allemagne",
    "Japan": "Japon",
    "Spain": "Espagne",
    "India": "Inde",
    "Mexico": "Mexique",
    "Indonesia": "Indonésie",
    "United States": "États-Unis",
}

@lru_cache(maxsize=1000)
def corriger_phrases_mal_traduites(texte: str) -> str:
    corrections = {
        "est en train d'aller": "affecte actuellement",
        "est en train de se rendre": "affecte actuellement",
        "est en train d'arriver": "a commencé à toucher",
        "est en train de frapper": "a frappé",
        "est en train de toucher": "touche actuellement",
    }
    for mauvais, bon in corrections.items():
        texte = texte.replace(mauvais, bon)
    texte = re.sub(r"\balerte de\b(?! niveau)", "niveau d'alerte de", texte, flags=re.IGNORECASE)
    texte = re.sub(r"\bniveau d'niveau d'alerte\b", "niveau d'alerte", texte, flags=re.IGNORECASE)
    return texte

@lru_cache(maxsize=1000)
def traduire_texte(texte: str) -> str:
    try:
        if not texte:
            return ''
        if re.search(r'[a-zA-Z]', texte):
            texte_traduit = translator.translate(texte, dest='fr').text
            return corriger_phrases_mal_traduites(texte_traduit)
        return texte
    except Exception as e:
        print("Erreur traduction:", e)
        return texte or ''

def extraire_dates(desc: str, titre: str = ''):
    pattern = r"(\d{2}/\d{2}/\d{4})"
    found = re.findall(pattern, desc)
    if not found:
        found = re.findall(pattern, titre)
    try:
        if len(found) >= 2:
            from_date = datetime.strptime(found[0], '%d/%m/%Y').replace(tzinfo=timezone.utc)
            to_date = datetime.strptime(found[1], '%d/%m/%Y').replace(tzinfo=timezone.utc)
            return from_date, to_date, None
        elif len(found) == 1:
            event_date = datetime.strptime(found[0], '%d/%m/%Y').replace(tzinfo=timezone.utc)
            return None, None, event_date
    except Exception as e:
        print("Erreur parsing date:", e)
    return None, None, None

def determiner_statut(now, from_date, to_date, event_date):
    if from_date and to_date:
        if now.date() < from_date.date():
            return 'futures'
        elif from_date.date() <= now.date() <= to_date.date():
            return 'presentes'
        else:
            return 'passees'
    elif event_date:
        if now.date() < event_date.date():
            return 'futures'
        elif event_date.date() == now.date():
            return 'presentes'
        else:
            return 'passees'
    return 'presentes'

@router.get("/api/alerts")
def get_alerts():
    if "data" in cache:
        return cache["data"]

    try:
        url = 'http://www.gdacs.org/xml/rss.xml'
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()

        xml_content = resp.content.decode('utf-8-sig')
        root = ET.fromstring(xml_content)

        now = datetime.now(timezone.utc)
        presentes, futures, passees, alertes_all = [], [], [], []
        cles_uniques = set()

        for item in root.findall(".//item"):
            title_raw = item.findtext("title", '')
            desc_raw = item.findtext("description", '')
            link = item.findtext("link", '')
            country = item.findtext("{http://www.gdacs.org}country", '')

            country_fr = traductions_manuelles.get(country)
            if not country_fr:
                country_fr = traduire_texte(country)

            severity = item.findtext("{http://www.gdacs.org}severity", '')
            alert_level = item.findtext("{http://www.gdacs.org}alertlevel", '')
            georss = item.findtext("{http://www.georss.org/georss}point")
            lat, lon = (georss.split() if georss else (None, None))

            from_date, to_date, event_date = extraire_dates(desc_raw, title_raw)
            statut = determiner_statut(now, from_date, to_date, event_date)

            titre_traduit = traduire_texte(title_raw)
            description = traduire_texte(desc_raw)
            if statut == 'passees':
                description = description.replace("est en train de se produire", "s'est produit")

            # ✅ Générer une clé unique pour filtrer les doublons
            cle_alerte = f"{titre_traduit.strip().lower()}|{country_fr.strip().lower()}|{alert_level.strip().lower()}"
            if cle_alerte in cles_uniques:
                continue
            cles_uniques.add(cle_alerte)

            alerte = {
                'title': titre_traduit,
                'description': description,
                'link': link,
                'country': country_fr,
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

        result = {
            'all': alertes_all,
            'presentes': presentes,
            'futures': futures,
            'passees': passees
        }

        cache["data"] = result
        return result

    except requests.exceptions.RequestException as e:
        print("Erreur réseau:", e)
        return {"error": f"Erreur de récupération des données: {e}"}
    except ET.ParseError as e:
        print("Erreur XML:", e)
        return {"error": f"Erreur de lecture du flux XML: {e}"}
    except Exception as e:
        print("Erreur générale:", e)
        return {"error": f"Erreur interne: {e}"}
