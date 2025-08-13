import { useEffect, useState } from "react";

const WeatherInfo = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fonction pour charger les données météo
  const fetchWeather = () => {
    setLoading(true);
    setError(null);
    fetch("http://localhost:8000/weather/global", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          setWeather(null);
        } else if (
          data.hottest_cities &&
          Array.isArray(data.hottest_cities) &&
          data.coldest_cities &&
          Array.isArray(data.coldest_cities)
        ) {
          setWeather(data);
        } else {
          setError("Données météo globales indisponibles.");
          setWeather(null);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError("Erreur lors du chargement des données météo");
        setWeather(null);
        setLoading(false);
        console.error(err);
      });
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return <p className="text-red-600 p-4 bg-red-100 rounded">{error}</p>;
  }

  if (!weather) {
    return <p>Données météo indisponibles.</p>;
  }

  return (
    <div className="mt-6 p-4 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Résumé météo global</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-orange-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-orange-700 mb-3">Villes les plus chaudes :</h3>
          <ul className="space-y-3">
            {weather.hottest_cities.map((city, index) => (
              <li key={index} className="flex items-center gap-3 p-2 bg-white rounded shadow-sm">
                <img
                  src={`https://flagcdn.com/24x18/${city.country_code}.png`}
                  alt=""
                  className="rounded-sm"
                  width="24"
                  height="18"
                />
                <img
                  src={`https://openweathermap.org/img/wn/${city.icon}@2x.png`}
                  alt={city.weather}
                  width="40"
                  height="40"
                  className="bg-blue-50 rounded-full"
                />
                <div>
                  <span className="font-bold">{city.city}</span>
                  <div className="text-sm">
                    <span className="text-orange-600 font-bold">{city.temperature}°C</span> - {city.weather}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-700 mb-3">Villes les plus froides :</h3>
          <ul className="space-y-3">
            {weather.coldest_cities.map((city, index) => (
              <li key={index} className="flex items-center gap-3 p-2 bg-white rounded shadow-sm">
                <img
                  src={`https://flagcdn.com/24x18/${city.country_code}.png`}
                  alt=""
                  className="rounded-sm"
                  width="24"
                  height="18"
                />
                <img
                  src={`https://openweathermap.org/img/wn/${city.icon}@2x.png`}
                  alt={city.weather}
                  width="40"
                  height="40"
                  className="bg-blue-50 rounded-full"
                />
                <div>
                  <span className="font-bold">{city.city}</span>
                  <div className="text-sm">
                    <span className="text-blue-600 font-bold">{city.temperature}°C</span> - {city.weather}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* BOUTON CENTRÉ */}
      <div className="flex justify-center mt-6">
        <button
          onClick={fetchWeather}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
        >
          Rafraîchir les données
        </button>
      </div>
    </div>
  );
};

export default WeatherInfo;
