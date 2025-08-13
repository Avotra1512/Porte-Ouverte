from fastapi import APIRouter
import httpx
import csv
import os

router = APIRouter()

# Clé OpenWeatherMap (à sécuriser via .env en prod)
OPENWEATHER_API_KEY = "f6cca7b3ae4c9ffb94f23ae0bbfde205"
WEATHER_BASE_URL = "http://api.openweathermap.org/data/2.5/weather"
ALERTS_BASE_URL = "http://api.openweathermap.org/data/2.5/onecall"
GEOCODING_BASE_URL = "https://nominatim.openstreetmap.org/reverse"

# Chemin vers le CSV
CSV_FILE_PATH = os.path.join(os.path.dirname(__file__), "data", "worldcities.csv")

# Chargement des villes depuis le CSV au démarrage
cities = []
with open(CSV_FILE_PATH, newline='', encoding='utf-8') as csvfile:
    reader = csv.reader(csvfile)
    header = next(reader)  # En-têtes du CSV

    # Trouver les indices des colonnes nécessaires
    # D'après le CSV, colonnes importantes : 
    # 0: name, 2: latitude, 3: longitude, 4: country, 5: country_code
    name_idx = 0
    lat_idx = 2
    lon_idx = 3
    country_idx = 4
    country_code_idx = 5

    for row in reader:
        try:
            city = {
                "name": row[name_idx].strip('"'),
                "country": row[country_idx].strip('"'),
                "country_code": row[country_code_idx].strip('"'),
                "latitude": float(row[lat_idx].strip('"')),
                "longitude": float(row[lon_idx].strip('"'))
            }
            cities.append(city)
        except Exception:
            continue  # Ignore lignes mal formées

@router.get("/home")
def get_home():
    return {"message": "Bienvenue sur l'API Météo avec données réelles"}

@router.get("/weather/global")
async def get_global_weather(limit: int = 20):
    results = []
    selected_cities = cities[:limit]  # Prendre les premières villes selon limit

    async with httpx.AsyncClient() as client:
        for city in selected_cities:
            lat = city["latitude"]
            lon = city["longitude"]
            name = city["name"]
            country = city["country"]
            country_code = city["country_code"]

            weather_url = (
                f"{WEATHER_BASE_URL}?lat={lat}&lon={lon}"
                f"&appid={OPENWEATHER_API_KEY}&units=metric&lang=fr"
            )
            try:
                weather_response = await client.get(weather_url)
                weather_response.raise_for_status()
                weather_data = weather_response.json()
                results.append({
                    "city": f"{name}, {country}",
                    "country_code": country_code.lower(),
                    "temperature": weather_data["main"]["temp"],
                    "humidity": weather_data["main"]["humidity"],
                    "weather": weather_data["weather"][0]["description"],
                    "icon": weather_data["weather"][0]["icon"],
                    "lat": lat,
                    "lon": lon,
                })
            except Exception:
                continue  # Ignore erreurs météo pour une ville

    if not results:
        return {"error": "Aucune donnée météo récupérée."}

    hottest = sorted(results, key=lambda x: x["temperature"], reverse=True)[:3]
    coldest = sorted(results, key=lambda x: x["temperature"])[:3]

    return {
        "hottest_cities": hottest,
        "coldest_cities": coldest
    }

@router.get("/weather/search/{city_name}")
async def search_weather_by_city(city_name: str):
    geo_url = f"http://api.openweathermap.org/geo/1.0/direct?q={city_name}&limit=5&appid={OPENWEATHER_API_KEY}"

    async with httpx.AsyncClient() as client:
        geo_response = await client.get(geo_url)
        if geo_response.status_code != 200:
            return {"error": "Erreur lors de la recherche de la ville."}

        cities_data = geo_response.json()
        if not cities_data:
            return {"error": "Aucune ville trouvée avec ce nom."}

        weather_results = []

        for city in cities_data:
            lat = city["lat"]
            lon = city["lon"]
            full_name = f"{city['name']}, {city.get('state', '')} {city['country']}".strip()
            country_code = city['country'].lower()  # Code pays à 2 lettres

            weather_url = f"{WEATHER_BASE_URL}?lat={lat}&lon={lon}&appid={OPENWEATHER_API_KEY}&units=metric&lang=fr"
            weather_response = await client.get(weather_url)

            if weather_response.status_code == 200:
                weather_data = weather_response.json()

                geo_info_url = f"{GEOCODING_BASE_URL}?lat={lat}&lon={lon}&format=json"
                geo_info_headers = {
                    "User-Agent": "WeatherApp/1.0 (contact@yourdomain.com)"
                }
                geo_info_response = await client.get(geo_info_url, headers=geo_info_headers)

                region = postal_code = district = None
                if geo_info_response.status_code == 200:
                    geo_data = geo_info_response.json()
                    if 'address' in geo_data:
                        region = geo_data['address'].get('region')
                        postal_code = geo_data['address'].get('postcode')
                        district = geo_data['address'].get('suburb')

                weather_results.append({
                    "city_full_name": full_name,
                    "country_code": country_code,
                    "temperature": weather_data["main"]["temp"],
                    "weather": weather_data["weather"][0]["description"],
                    "humidity": weather_data["main"]["humidity"],
                    "wind_speed": weather_data["wind"]["speed"],
                    "icon": weather_data["weather"][0]["icon"],
                    "region": region,
                    "postal_code": postal_code,
                    "district": district,
                    "latitude": lat,
                    "longitude": lon
                })

        if not weather_results:
            return {"error": "Impossible de récupérer les informations météorologiques pour cette ville."}

        return weather_results

@router.get("/weather/alerts/global")
async def get_global_weather_alerts():
    url = f"{ALERTS_BASE_URL}?lat=0&lon=0&appid={OPENWEATHER_API_KEY}&units=metric"
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        data = response.json()
    return data.get("alerts", [])
