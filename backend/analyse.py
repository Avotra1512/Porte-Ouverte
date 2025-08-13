from fastapi import APIRouter, HTTPException
import requests

router = APIRouter()

API_KEY = "d780487e585c9e8444c293c663f2b766"
GEOCODE_URL = "http://api.openweathermap.org/geo/1.0/direct"
BASE_URL = "https://api.openweathermap.org/data/2.5/forecast"

DEFAULT_CITY = "Antananarivo, Analamanga, Province d’Antananarivo, 101, Madagascar"

# Fonction pour récupérer les coordonnées géographiques d'une ville
def get_coordinates(city):
    def request_coordinates(city_query):
        params = {
            "q": city_query,
            "limit": 1,
            "appid": API_KEY
        }
        res = requests.get(GEOCODE_URL, params=params)
        if res.status_code != 200 or not res.json():
            return None
        data = res.json()[0]
        return data["lat"], data["lon"]

    coords = request_coordinates(city)
    if coords:
        return coords

    city_simple = city.split(',')[0]
    coords = request_coordinates(city_simple.strip())
    return coords

@router.get("/weather/")
@router.get("/weather/{city}")
async def get_weather(city: str = None):
    if not city:
        city = DEFAULT_CITY  # Utilisation de la ville par défaut si city est vide

    coords = get_coordinates(city)
    if not coords:
        raise HTTPException(status_code=404, detail=f"Ville '{city}' non trouvée")

    lat, lon = coords
    params = {
        "lat": lat,
        "lon": lon,
        "appid": API_KEY,
        "units": "metric",
    }
    res = requests.get(BASE_URL, params=params)
    if res.status_code != 200:
        raise HTTPException(status_code=500, detail="Erreur lors de la récupération des données météo")

    data = res.json()

    # Initialisation du résultat
    result = {
        "labels": [],
        "temperatures": [],
        "pressures": [],
        "humidities": [],
        "descriptions": [],
        "wind_speeds": [],  # Ajout du vent
    }

    # Extraction des données pour les 8 premiers créneaux horaires (~24h)
    for point in data["list"][:8]:
        result["labels"].append(point["dt_txt"])
        result["temperatures"].append(point["main"]["temp"])
        result["pressures"].append(point["main"]["pressure"])
        result["humidities"].append(point["main"]["humidity"])
        result["descriptions"].append(point["weather"][0]["main"])
        
        # Ajout de la vitesse du vent (si elle est disponible)
        if "wind" in point:
            result["wind_speeds"].append(point["wind"]["speed"])  # Vitesse du vent
        else:
            result["wind_speeds"].append(None)  # Si pas de données de vent, mettre None

    return result
