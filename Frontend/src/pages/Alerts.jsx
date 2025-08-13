import { useState } from "react";

const Alerts = () => {
  const [alerts] = useState([
    { title: "Tempête en approche", description: "Risque de fortes rafales de vent ce soir." },
    { title: "Vague de chaleur", description: "Températures élevées attendues cette semaine." },
  ]);

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-red-600">🚨 Alertes Météo</h2>
      {alerts.map((alert, index) => (
        <div key={index} className="bg-red-100 p-4 rounded mt-4">
          <h3 className="text-lg font-bold text-red-700">{alert.title}</h3>
          <p>{alert.description}</p>
        </div>
      ))}
    </div>
  );
};

export default Alerts;