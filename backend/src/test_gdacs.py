import requests

url = 'http://www.gdacs.org/xml/rss.xml'
response = requests.get(url)

print("Statut :", response.status_code)
print("Type de contenu :", response.headers.get('Content-Type'))
print(response.text[:500])  # Affiche les 500 premiers caractères du XML
