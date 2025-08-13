from fastapi import APIRouter
import requests

router = APIRouter()

API_KEY = "d780487e585c9e8444c293c663f2b766"  # Mets ta propre clé API
GEOCODE_URL = "http://api.openweathermap.org/geo/1.0/direct"
BASE_URL = "https://api.openweathermap.org/data/2.5/forecast"

# Obtenir les coordonnées (latitude, longitude) d'une ville
def get_coordinates(city):
    params = {
        "q": city,
        "limit": 1,
        "appid": API_KEY
    }
    res = requests.get(GEOCODE_URL, params=params)
    if res.status_code != 200 or not res.json():
        return None
    data = res.json()[0]
    return data["lat"], data["lon"]

# Route FastAPI pour obtenir les prévisions météo
@router.get("/weather/{city}")
async def get_weather(city: str):
    coords = get_coordinates(city)
    if not coords:
        return {"error": f"Ville '{city}' non trouvée"}

    lat, lon = coords
    params = {
        "lat": lat,
        "lon": lon,
        "appid": API_KEY,
        "units": "metric",
    }
    res = requests.get(BASE_URL, params=params)
    if res.status_code != 200:
        return {"error": "Erreur lors de la récupération des données météo"}

    data = res.json()
    result = {
        "labels": [],
        "temperatures": [],
        "pressures": [],
        "humidities": [],
        "descriptions": [],
    }

    for point in data["list"][:8]:
        result["labels"].append(point["dt_txt"])
        result["temperatures"].append(point["main"]["temp"])
        result["pressures"].append(point["main"]["pressure"])
        result["humidities"].append(point["main"]["humidity"])
        result["descriptions"].append(point["weather"][0]["main"])

    return result
