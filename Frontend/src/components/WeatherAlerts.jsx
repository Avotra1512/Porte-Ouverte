import { useEffect, useState } from "react";

const GlobalWeatherAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAlerts = () => {
    setLoading(true);
    setError(null);
    fetch("http://localhost:8000/weather/alerts/global")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Erreur réseau lors de la récupération des alertes");
        }
        return res.json();
      })
      .then((data) => {
        setAlerts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur lors du chargement des alertes globales :", err);
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-red-500"></div>
        <span className="ml-4 text-red-600 font-semibold">Chargement des alertes...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-6">
        <strong className="font-bold">Erreur :</strong> <span>{error}</span>
        <button
          onClick={fetchAlerts}
          className="ml-4 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
        >
          Réessayer
        </button>
      </div>
    );
  }

  // Choix de la couleur selon la présence d'alertes
  const containerClasses =
    alerts.length === 0
      ? "bg-green-50 border-l-4 border-green-400 text-green-700"
      : "bg-red-50 border-l-4 border-red-400 text-red-700";

  return (
    <div
      className={`${containerClasses} p-6 rounded-xl mt-6 max-w-4xl mx-auto shadow`}
    >
      <h2 className="text-2xl font-semibold mb-4">
        Alertes Météo Globales
      </h2>

      {alerts.length > 0 ? (
        alerts.map((alert, index) => (
          <div
            key={index}
            className="mb-6 border-b border-current pb-4 last:border-none"
          >
            <p className="font-bold text-lg mb-1 flex items-center gap-2">
              <span role="img" aria-label="warning">
                ⚠️
              </span>{" "}
              {alert.title}
            </p>
            <p className="mb-2 whitespace-pre-line">{alert.description}</p>
            <p className="italic text-sm">
              {alert.regions && alert.regions.length > 0
                ? `Zones affectées : ${alert.regions.join(", ")}`
                : "Zones non spécifiées"}
            </p>
          </div>
        ))
      ) : (
        <p className="text-center italic">Aucune alerte météo active à l'échelle mondiale.</p>
      )}

      <div className="flex justify-end mt-4">
        <button
          onClick={fetchAlerts}
          className={`px-10 py-2 rounded transition ${
            alerts.length === 0
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-red-600 hover:bg-red-700 text-white"
          }`}
        >
          Rafraîchir les alertes
        </button>
      </div>
    </div>
  );
};

export default GlobalWeatherAlerts;
