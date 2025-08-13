import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from "framer-motion";

function interpretPrecipitation(mm) {
  if (mm === 0) return "Pas de pluie";
  if (mm > 0 && mm <= 0.9) return "Pluie très faible";
  if (mm > 0.9 && mm <= 10) return "Pluie faible";
  if (mm > 10 && mm <= 30) return "Pluie modérée";
  if (mm > 30 && mm <= 70) return "Pluie forte";
  if (mm > 70 && mm <= 150) return "Pluie très forte";
  return "Pluie extrêmement forte";
}

function Prediction() {
  // États existants
  const [city, setCity] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [futureDays, setFutureDays] = useState(0);
  const [forecastData, setForecastData] = useState([]);
  const [error, setError] = useState('');
  const [isRangeMode, setIsRangeMode] = useState(false);
  const [userCity, setUserCity] = useState('');
  const [userForecast, setUserForecast] = useState([]);
  const [userGeoError, setUserGeoError] = useState('');
  
  // Nouveaux états pour la recherche améliorée
  const [inputValue, setInputValue] = useState(''); // Valeur de l'input
  const [suggestions, setSuggestions] = useState([]); // Liste des suggestions
  const [lat, setLat] = useState(null); // Latitude
  const [lon, setLon] = useState(null); // Longitude
  const [countries, setCountries] = useState([]); // Liste des pays
  const [loading, setLoading] = useState(false); // Indicateur de chargement
  const [showSuggestions, setShowSuggestions] = useState(false);

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  // Charger la liste des pays automatiquement
  useEffect(() => {
    fetch('https://restcountries.com/v3.1/all')
      .then(res => res.json())
      .then(data => {
        const countryNames = data.map(c => c.name.common).sort();
        setCountries(countryNames);
      })
      .catch(err => console.error('Erreur lors du chargement des pays:', err));
  }, []);

  // Mettre à jour les suggestions selon la saisie (pays ou villes)
  useEffect(() => {
    if (inputValue.trim() === '') {
      setSuggestions([]);
      setShowSuggestions(false);
    } else {
      if (inputValue.length === 1 && /^[a-zA-Z]$/.test(inputValue)) {
        // Suggestions basées sur les pays si une seule lettre est saisie
        const filteredCountries = countries.filter(country =>
          country.toLowerCase().startsWith(inputValue.toLowerCase())
        );
        setSuggestions(filteredCountries.slice(0, 10)); // Max 10 suggestions
        setShowSuggestions(true);
      } else if (inputValue.length > 1) {
        // Pour plus de lettres, rechercher à la fois dans les pays et villes
        fetchPlaceSuggestions(inputValue);
      }
    }
  }, [inputValue, countries]);

  // Recherche des lieux en fonction de la saisie utilisateur
  const fetchPlaceSuggestions = async (input) => {
    if (!input || input.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      setLoading(true);
      // Filtrer les pays correspondants
      const matchingCountries = countries.filter(country =>
        country.toLowerCase().includes(input.toLowerCase())
      ).slice(0, 3); // Limiter à 3 pays

      // Rechercher les villes via Nominatim
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: input,
          format: 'json',
          addressdetails: 1,
          limit: 5
        },
        headers: { "User-Agent": "MyWeatherApp/1.0" }
      });

      // Combiner les résultats (pays + villes)
      const combinedSuggestions = [
        ...matchingCountries.map(country => ({ type: 'country', name: country })),
        ...response.data.map(place => ({ 
          type: 'place', 
          ...place,
          displayText: `${place.address.city || place.address.town || place.address.village || place.address.hamlet || ''}, ${place.address.postcode || ''}, ${place.address.country}`
        }))
      ];

      setSuggestions(combinedSuggestions);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Erreur lors de la recherche :', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  // Lorsque l'utilisateur choisit une suggestion
  const handleSuggestionClick = (suggestion) => {
    if (suggestion.type === 'place') {
      // Si la suggestion est une ville
      setCity(suggestion.address.city || suggestion.address.town || suggestion.address.village || suggestion.address.hamlet || suggestion.display_name);
      setLat(suggestion.lat);
      setLon(suggestion.lon);
      setInputValue(suggestion.displayText);
    } else {
      // Si c'est un pays
      setCity(suggestion.name);
      setLat(null);
      setLon(null);
      setInputValue(suggestion.name);
    }
    setShowSuggestions(false);
  };

  useEffect(() => {
    if (isRangeMode && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setFutureDays(diffDays > 0 ? diffDays : 0);
    } else {
      setFutureDays(1);
    }
  }, [startDate, endDate, isRangeMode]);

  // Détection de la position de l'utilisateur
  useEffect(() => {
    const detectUserLocation = async () => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
                params: {
                  lat: latitude,
                  lon: longitude,
                  format: 'json',
                  addressdetails: 1
                },
                headers: { "User-Agent": "MyWeatherApp/1.0" }
              });

              const cityName = response.data.address.city ||
                response.data.address.town ||
                response.data.address.village;
              if (cityName) {
                setUserCity(cityName);
                const tomorrowStr = tomorrow.toISOString().split('T')[0];
                const forecastRes = await axios.get(
                  `http://127.0.0.1:8000/predict/${cityName}/${tomorrowStr}/${tomorrowStr}/7`
                );
                setUserForecast(forecastRes.data);
              }
            } catch (err) {
              setUserGeoError("Impossible de détecter votre ville");
            }
          },
          (error) => {
            setUserGeoError("Autorisation de géolocalisation requise");
          }
        );
      } else {
        setUserGeoError("Géolocalisation non supportée");
      }
    };

    detectUserLocation();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Utiliser city directement (rempli par handleSuggestionClick)
    if (!city || !startDate || (isRangeMode && !endDate) || futureDays < 1) {
      setError("Veuillez remplir tous les champs correctement.");
      return;
    }
    const finalEndDate = isRangeMode ? endDate : startDate;

    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/predict/${city}/${startDate}/${finalEndDate}/${futureDays}`
      );
      setForecastData(response.data);
    } catch (err) {
      setError("Erreur lors de la récupération des données. Vérifiez que l'API FastAPI fonctionne.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-white p-6 md:p-12">

      {/* Section géolocalisation */}
      {userCity && (
  <motion.section
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  className="mb-8 bg-white p-8 rounded-2xl shadow-lg border-2 border-green-200"
>
  <h2 className="text-3xl font-bold text-green-700 mb-8 text-center">
    🌍 Prévisions sur 7 jours pour {userCity}
  </h2>
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-8">
    {userForecast.map((day, index) => (
      <div key={index} className="bg-green-50 p-15 rounded-xl shadow flex flex-col items-center mb-4">
        <p className="font-semibold text-green-800 mb-2">
          {new Date(day.date).toLocaleDateString()}
        </p>
        <p className="text-3xl my-4">{day.temperature?.toFixed(1)}°C</p>
        <div className="flex flex-col items-center gap-3">
          <span className="text-base">
            🌧️ {interpretPrecipitation(day.predicted_precipitation)}
          </span>
          <span className="text-base">
            💨 {day.wind_speed !== undefined ? day.wind_speed.toFixed(1) + " km/h" : "-"}
          </span>
        </div>
      </div>
    ))}
  </div>
</motion.section>
)}


      {userGeoError && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
          ⚠️ {userGeoError}
        </div>
      )}

      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, type: "spring", stiffness: 70 }}
        className="mb-12 py-8 bg-green-600 text-white rounded-xl shadow text-center"
      >
        <h1 className="text-4xl font-bold">
          {city ? `Prévisions Météo pour ${city}` : "Prédiction"}
        </h1>
        <p className="mt-2 text-lg">
          {city
            ? `Obtenez les prévisions météo du ${startDate || '...'} au ${endDate || startDate || '...'}`
            : "Obtenez des prédictions précises selon votre ville et vos dates"}
        </p>
      </motion.header>

      {/* Toggle jour / intervalle */}
      <div className="flex justify-center mb-8">
        <button
          onClick={() => setIsRangeMode(!isRangeMode)}
          className="bg-white border border-green-600 text-green-600 font-medium px-6 py-2 rounded-full shadow hover:bg-green-600 hover:text-white transition"
        >
          Mode : {isRangeMode ? "Plusieurs jours" : "Un seul jour"}
        </button>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md mb-8 border border-green-300">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div className="md:col-span-3 relative">
            <label className="block text-gray-700 mb-1">Ville ou Pays</label>
            <input
              type="text"
              value={inputValue}
              onChange={e => {
                setInputValue(e.target.value);
                setCity(''); // Réinitialiser la ville si l'utilisateur tape à nouveau
              }}
              className="w-full bg-white border border-green-400 rounded px-4 py-2"
              placeholder="Ex : Paris, France, Madagascar..."
              autoComplete="off"
              required
            />
            {loading && (
              <div className="absolute z-10 bg-white border border-green-300 rounded w-full mt-1 px-4 py-2 shadow-lg text-gray-500 italic">
                Chargement...
              </div>
            )}
            {showSuggestions && suggestions.length > 0 && !loading && (
              <ul className="absolute z-10 bg-white border border-green-300 rounded w-full mt-1 max-h-56 overflow-y-auto shadow-lg">
                {suggestions.map((suggestion, idx) => (
                  <li
                    key={idx}
                    className="px-4 py-2 hover:bg-green-100 cursor-pointer"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion.type === 'country' ? (
                      <div className="flex items-center">
                        <span className="mr-2"></span> {suggestion.name}
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <span className="mr-2"></span> {suggestion.displayText}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
            {showSuggestions && suggestions.length === 0 && !loading && inputValue.length > 0 && (
              <div className="absolute z-10 bg-white border border-green-300 rounded w-full mt-1 px-4 py-2 shadow-lg text-gray-500 italic">
                Aucun résultat trouvé
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-gray-700 mb-1">
              {isRangeMode ? "Date de début" : "Date de prévision"}
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={minDate}
              className="w-full bg-white border border-green-400 rounded px-4 py-2"
              required
            />
          </div>

          {isRangeMode && (
            <div>
              <label className="block text-gray-700 mb-1">Date de fin</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || minDate}
                className="w-full bg-white border border-green-400 rounded px-4 py-2"
                required={isRangeMode}
              />
            </div>
          )}

          {isRangeMode && (
            <div>
              <label className="block text-gray-700 mb-1">Nombre de jours à prédire</label>
              <div className="mt-1 text-xl font-semibold text-green-700 bg-green-100 border border-green-300 rounded px-4 py-2 shadow-sm">
                {startDate && endDate ? `${futureDays} jour(s)` : '_'}
              </div>
            </div>
          )}
        </div>
        
        <div className="text-center">
          <button
            type="submit"
            className="bg-green-600 text-white font-semibold px-8 py-3 rounded-full shadow hover:bg-green-700 transition duration-300"
            disabled={loading}
          >
            {loading ? 'Chargement...' : 'Obtenir les prévisions'}
          </button>
          {error && <p className="text-red-600 mt-4">{error}</p>}
        </div>
      </form>

      {/* Résultat */}
      {forecastData.length > 0 && (
        <section className="bg-white rounded-xl shadow p-6 border border-green-400">
          <h2 className="text-2xl font-bold text-green-600 mb-6 text-center">Prévisions Météo</h2>
          <div className="overflow-x-auto">
            <table className="w-full table-auto border border-green-300 text-gray-800">
              <thead>
                <tr className="bg-green-100 text-center">
                  <th className="border px-4 py-2">Date</th>
                  <th className="border px-4 py-2">Température (°C)</th>
                  <th className="border px-4 py-2">Précipitations</th>
                  <th className="border px-4 py-2">Vitesse du vent (km/h)</th>
                </tr>
              </thead>
              <tbody>
                {forecastData.map((data, index) => (
                  <tr key={index} className="text-center">
                    <td className="border px-4 py-2">{data.date}</td>
                    <td className="border px-4 py-2">{data.temperature?.toFixed(1)}</td>
                    <td className="border px-4 py-2">
                      {interpretPrecipitation(data.predicted_precipitation)}
                      {data.predicted_precipitation > 0 ? ` (${data.predicted_precipitation?.toFixed(2)} mm)` : ""}
                    </td>
                    <td className="border px-4 py-2">
                      {data.wind_speed !== undefined ? data.wind_speed.toFixed(1) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

export default Prediction;
