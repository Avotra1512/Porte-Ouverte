from fastapi import APIRouter
import httpx

router = APIRouter()

# Clé API OpenWeatherMap
API_KEY = "f6cca7b3ae4c9ffb94f23ae0bbfde205"
WEATHER_BASE_URL = "http://api.openweathermap.org/data/2.5/weather"
ALERTS_BASE_URL = "http://api.openweathermap.org/data/2.5/onecall"

# Villes prédéfinies pour l'exemple
cities = ["Paris", "London", "New York", "Tokyo", "Sydney"]

@router.get("/")
def read_root():
    return {"message": "Bienvenue sur l'API Météo avec données réelles"}

@router.get("/weather/global")
async def get_global_weather():
    results = []

    async with httpx.AsyncClient() as client:
        for city in cities:
            url = f"{WEATHER_BASE_URL}?q={city}&appid={API_KEY}&units=metric"
            try:
                response = await client.get(url)
                data = response.json()
                if response.status_code == 200:
                    results.append({
                        "city": city,
                        "temp": data["main"]["temp"],  # Température de la ville
                        "latitude": data["coord"]["lat"],  # Latitude (si besoin pour la carte)
                        "longitude": data["coord"]["lon"],  # Longitude (si besoin pour la carte)
                    })
            except Exception as e:
                print(f"Erreur pour {city} : {e}")

    if not results:
        return {"error": "Impossible de récupérer les données"}

    hottest_cities = sorted(results, key=lambda x: x["temp"], reverse=True)[:3]
    coldest_cities = sorted(results, key=lambda x: x["temp"])[:3]

    return {
        "hottest_cities": hottest_cities,
        "coldest_cities": coldest_cities,
    }

@router.get("/weather/alerts/global")
async def get_global_weather_alerts():
    url = f"{ALERTS_BASE_URL}?lat=0&lon=0&appid={API_KEY}&units=metric"
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        data = response.json()

    alerts = data.get("alerts", [])
    return alerts


@router.get("/weather/city/{city_name}")
async def get_weather_by_city(city_name: str):
    url = f"{WEATHER_BASE_URL}?q={city_name}&appid={API_KEY}&units=metric&lang=fr"

    async with httpx.AsyncClient() as client:
        response = await client.get(url)

    if response.status_code == 200:
        data = response.json()
        return {
            "city": data["name"],
            "temperature": data["main"]["temp"],
            "weather": data["weather"][0]["description"],
            "icon": data["weather"][0]["icon"],
            "humidity": data["main"]["humidity"],
            "wind_speed": data["wind"]["speed"],
        }
    else:
        return {"error": "Ville non trouvée ou erreur API"}
