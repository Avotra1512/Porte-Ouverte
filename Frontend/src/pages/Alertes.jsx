import { useState, useEffect } from 'react';

const Alertes = () => {
  const [alertes, setAlertes] = useState({ presentes: [], futures: [], passees: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recherche, setRecherche] = useState("");
  const [paysFiltre, setPaysFiltre] = useState("");
  const [alerteActive, setAlerteActive] = useState(null);
  const [paysDisponibles, setPaysDisponibles] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [graviteFiltre, setGraviteFiltre] = useState("");

  useEffect(() => {
    const fetchAlertes = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/alerts');
        if (!response.ok) throw new Error('Erreur lors du chargement des alertes');
        const data = await response.json();
        setAlertes(data);

        const tousLesPays = [
          ...data.presentes.map((a) => a.country),
          ...data.futures.map((a) => a.country),
          ...data.passees.map((a) => a.country),
        ].filter(estPaysValide);

        const paysUniques = new Set();
        tousLesPays.forEach((pays) => {
          const paysList = pays.split(',').map((p) => p.trim());
          paysList.forEach((paysItem) => {
            if (estPaysValide(paysItem)) {
              paysUniques.add(paysItem);
            }
          });
        });

        setPaysDisponibles(Array.from(paysUniques).sort());
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAlertes();
  }, []);

  const estPaysValide = (pays) => {
    if (!pays) return false;
    const invalide = ['inconnu', '[unknown]', 'unknown', ''];
    return !invalide.includes(pays.toLowerCase());
  };

  const getGraviteColor = (niveau) => {
    switch (niveau) {
      case 'Green':
        return 'bg-green-500';
      case 'Orange':
        return 'bg-orange-500';
      case 'Red':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  const filtrerAlertesParPaysEtGravite = (liste) => {
    return liste.filter((alerte) => {
      const pays = alerte.country;
      const niveau = alerte.alert_level;
      return (
        estPaysValide(pays) &&
        (paysFiltre === "" || pays.toLowerCase().includes(paysFiltre.toLowerCase())) &&
        (graviteFiltre === "" || niveau === graviteFiltre)
      );
    });
  };

  const renderSection = (titre, liste) => {
    const alertesFiltrees = filtrerAlertesParPaysEtGravite(liste);

    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-2">{titre}</h2>
        {alertesFiltrees.length === 0 ? (
          <p className="italic">Aucune alerte pour cette section.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {alertesFiltrees.map((alerte, index) => {
              const isActive = alerteActive === `${titre}-${index}`;
              return (
                <div
                  key={index}
                  className={`bg-white shadow-lg rounded-xl p-4 cursor-pointer transform transition duration-300 ease-in-out
                    ${isActive ? "scale-105 ring-4 ring-blue-300 shadow-xl z-10" : "hover:scale-105 hover:bg-blue-100"}`}
                  onClick={() =>
                    setAlerteActive((prev) => (prev === `${titre}-${index}` ? null : `${titre}-${index}`))
                  }
                >
                  <h3 className="text-lg font-semibold">
                    <span className={`inline-block w-3 h-3 rounded-full mr-2 ${getGraviteColor(alerte.alert_level)}`}></span>
                    {alerte.title}
                  </h3>
                  <p>{alerte.description}</p>
                  <p><strong>Pays :</strong> {alerte.country}</p>
                  <a
                    href={alerte.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    Voir plus
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const rechercherPays = () => {
    setPaysFiltre(recherche);
  };

  const reinitialiser = () => {
    setRecherche("");
    setPaysFiltre("");
    setSuggestions([]);
    setGraviteFiltre("");
  };

  const handleRechercheChange = (e) => {
    const value = e.target.value;
    setRecherche(value);

    if (value.length > 0) {
      const filtered = paysDisponibles
        .filter((pays) => pays.toLowerCase().includes(value.toLowerCase()))
        .sort();

      const paysCommencantParRecherche = filtered.filter((pays) =>
        pays.toLowerCase().startsWith(value.toLowerCase())
      );

      const autresPays = filtered.filter(
        (pays) => !pays.toLowerCase().startsWith(value.toLowerCase())
      ).sort();

      setSuggestions([...paysCommencantParRecherche, ...autresPays]);
    } else {
      setSuggestions([]);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-gray-500"></div>
        <span className="ml-4 text-gray-600 font-semibold text-lg">
          Chargement des alertes...
        </span>
      </div>
    );
  }

  if (error) return <p>Erreur : {error}</p>;

  return (
    <div className="p-4 min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Alertes</h1>

        <div className="flex gap-4 mt-2">
          {[
            { couleur: 'bg-green-500', label: 'Gravité faible', valeur: 'Green' },
            { couleur: 'bg-orange-500', label: 'Gravité modérée', valeur: 'Orange' },
            { couleur: 'bg-red-500', label: 'Gravité élevée', valeur: 'Red' },
          ].map(({ couleur, label, valeur }) => (
            <button
              key={valeur}
              onClick={() => setGraviteFiltre(valeur === graviteFiltre ? "" : valeur)}
              className={`flex items-center gap-2 px-3 py-1 rounded-full border transition ${
                graviteFiltre === valeur
                  ? 'bg-blue-100 border-blue-500'
                  : 'hover:bg-gray-100 border-gray-300'
              }`}
            >
              <span className={`w-4 h-4 rounded-full ${couleur}`}></span>
              <span className="text-sm">{label}</span>
            </button>
          ))}

          {graviteFiltre && (
            <button
              onClick={() => setGraviteFiltre("")}
              className="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
            >
              Réinitialiser
            </button>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-2 md:items-center relative">
          <input
            type="text"
            placeholder="Rechercher un pays..."
            className="p-2 border rounded w-full md:w-96"
            value={recherche}
            onChange={handleRechercheChange}
          />
          <button
            onClick={rechercherPays}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Rechercher
          </button>
          <button
            onClick={reinitialiser}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
          >
            Réinitialiser
          </button>

          {suggestions.length > 0 && (
            <ul className="absolute left-0 w-[380px] border ring-blue-300 rounded bg-white mt-2 top-full max-h-40 overflow-y-auto z-10">
              {suggestions.map((pays, index) => (
                <li
                  key={index}
                  className="p-2 hover:bg-blue-100 cursor-pointer"
                  onClick={() => {
                    setRecherche(pays);
                    setSuggestions([]);
                    setPaysFiltre(pays);
                  }}
                >
                  {pays}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {renderSection("✅ Alertes Présentes", alertes.presentes)}
      {renderSection("🕒 Alertes Futures", alertes.futures)}
      {renderSection("🕰️ Alertes Passées", alertes.passees)}
    </div>
  );
};

export default Alertes;
