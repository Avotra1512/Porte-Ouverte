import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const CitySearch = () => {
  const [city, setCity] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); 

  const handleSearch = async () => {
    if (!city) return;
    setResults([]);
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`http://localhost:8000/weather/search/${city}`);
      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setResults([]);
      } else if (Array.isArray(data)) {
        setResults(data);
      } else {
        setError("Format de réponse inattendu du serveur.");
        setResults([]);
      }
    } catch (err) {
      setError("Erreur lors de la recherche");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCity("");
    setResults([]);
    setError("");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleMoreDetails = (cityName, regionName) => {
    navigate(`/simulation?city=${encodeURIComponent(cityName)}&region=${encodeURIComponent(regionName)}`);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md mt-6 w-full">
      <h2 className="text-xl font-semibold mb-4">🔍 Rechercher une ville</h2>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Entrez une ville (ex: Paris)"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyPress={handleKeyPress}
          className="border p-2 rounded flex-1 focus:ring-2 focus:ring-green-300 focus:outline-none"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors disabled:bg-green-300"
        >
          {loading ? "Recherche..." : "Rechercher"}
        </button>
        <button
          onClick={handleReset}
          className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded transition-colors"
        >
          Réinitialiser
        </button>
      </div>

      {error && <p className="text-red-600 p-3 bg-red-50 rounded">{error}</p>}

      {loading && (
        <div className="flex justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-bold text-green-800 mb-3">
            Résultats pour "{city}" :
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {results.map((result) => (
              <div key={result.city_full_name} className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <img
                    src={`https://flagcdn.com/24x18/${result.country_code}.png`}
                    alt=""
                    className="rounded-sm"
                    width="24"
                    height="18"
                  />
                  <h4 className="text-md font-bold">{result.city_full_name}</h4>
                </div>
                <div className="flex items-center mb-2">
                  <img
                    src={`https://openweathermap.org/img/wn/${result.icon}@2x.png`}
                    alt={result.weather}
                    className="bg-blue-50 rounded-full w-16 h-16"
                  />
                  <div className="ml-2">
                    <p className="font-bold text-xl">{result.temperature}°C</p>
                    <p>{result.weather}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <p>Humidité: {result.humidity}%</p>
                  <p>Vent: {result.wind_speed} m/s</p>
                  {result.region && <p>Région: {result.region}</p>}
                </div>
                <button
                  onClick={() => handleMoreDetails(result.city_full_name, result.region)}
                  className="mt-3 inline-block bg-green-100 hover:bg-green-200 text-green-800 px-3 py-1 rounded transition-colors"
                >
                  ➕ Plus de détails
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CitySearch;
