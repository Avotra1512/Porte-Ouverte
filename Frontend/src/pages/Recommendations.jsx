const recommendations = [
    {
      title: "Réduire son empreinte carbone",
      description: "Utilisez les transports en commun, le vélo ou la marche autant que possible.",
    },
    {
      title: "Économiser l'eau",
      description: "Privilégiez les douches courtes et limitez l'utilisation excessive d'eau.",
    },
    {
      title: "Adopter une alimentation durable",
      description: "Réduisez la consommation de viande et privilégiez les produits locaux.",
    },
    {
      title: "Planter des arbres",
      description: "Aidez à absorber le CO₂ en participant à des programmes de reforestation.",
    },
  ];
  
  const Recommendations = () => {
    return (
      <div className="p-6 max-w-3xl mx-auto bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold text-green-700">🌱 Conseils pour s’adapter</h2>
        {recommendations.map((rec, index) => (
          <div key={index} className="bg-green-100 p-4 rounded mt-4">
            <h3 className="text-lg font-bold text-green-800">{rec.title}</h3>
            <p>{rec.description}</p>
          </div>
        ))}
      </div>
    );
  };
  
  export default Recommendations;
  