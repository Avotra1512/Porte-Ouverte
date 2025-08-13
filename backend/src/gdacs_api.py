from flask import Flask, jsonify
from flask_cors import CORS
import requests
import xml.etree.ElementTree as ET
from googletrans import Translator

app = Flask(__name__)
CORS(app)

translator = Translator()

# Fonction pour traduire un texte avec gestion d’erreur
def traduire_texte(texte):
    try:
        if texte:
            traduction = translator.translate(texte, dest='fr')
            return traduction.text
        return texte
    except Exception as e:
        print("Erreur traduction:", e)
        return texte  # Retourne le texte original en cas d'erreur

@app.route('/api/alerts', methods=['GET'])
def get_alerts():
    try:
        url = 'http://www.gdacs.org/xml/rss.xml'
        response = requests.get(url)
        print("Requête RSS status:", response.status_code)

        if response.status_code != 200:
            return jsonify({"error": f"Erreur lors de la récupération des alertes : {response.status_code}"}), 500

        xml_content = response.content.decode('utf-8-sig')
        root = ET.fromstring(xml_content)

        alerts = []
        for item in root.findall(".//item"):
            title = item.findtext("title")
            description = item.findtext("description")

            alert = {
                "title": traduire_texte(title),
                "description": traduire_texte(description),
                "link": item.findtext("link"),
                "pubDate": item.findtext("pubDate"),
                "country": item.findtext("{http://www.gdacs.org}country"),
                "severity": item.findtext("{http://www.gdacs.org}severity"),
                "latitude": item.findtext("{http://www.georss.org/georss}point").split()[0],
                "longitude": item.findtext("{http://www.georss.org/georss}point").split()[1],
                "alert_level": item.findtext("{http://www.gdacs.org}alertlevel"),
            }
            alerts.append(alert)

        print(f"{len(alerts)} alertes récupérées.")
        return jsonify(alerts)

    except Exception as e:
        print("Erreur principale:", str(e))
        return jsonify({"error": f"Erreur interne : {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True)
