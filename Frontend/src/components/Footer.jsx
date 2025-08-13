import React, { useState } from "react";
import img from "../assets/logo.jfif";
import AboutModal from "./AboutModal";

const Footer = () => {
  const [modal, setModal] = useState({ title: "", content: "", visible: false });

  const openModal = (title, content) => {
    setModal({ title, content, visible: true });
  };

  const closeModal = () => {
    setModal({ ...modal, visible: false });
  };

  return (
    <div>
      <div className="flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm">

        <div>
          <div className="flex items-center space-x-2">
            <img src={img} alt="Logo" className="mb-5 h-20 w-20 rounded-full" />
            <h1 className="text-2xl font-bold">TerraSmart</h1>
          </div>
          <p className="w-full md:w-2/3 text-gray-600">
            Notre mission est de vous fournir des informations précises sur le climat
            et vous aider à vous adapter aux changements climatiques.
          </p>
        </div>

        <div>
          <p className="text-xl font-medium mb-5">À propos de nous</p>
          <ul className="flex flex-col gap-1 text-gray-600 cursor-pointer">
            <li onClick={() => openModal("Notre vision", `Chez TerraSmart, notre vision est de créer un avenir durable où chaque citoyen peut anticiper les changements climatiques et adapter ses activités en conséquence. Nous croyons que l'accès à une information météo précise et contextualisée est une clé pour la résilience environnementale.`)}>
              Notre vision
            </li>
            <li onClick={() => openModal("Notre équipe", `TerraSmart est portée par une équipe pluridisciplinaire composée de développeurs passionnés, de climatologues, de data scientists et de communicants engagés.`)}>
              Notre équipe
            </li>
            <li onClick={() => openModal("Partenaires", `Nous collaborons avec des institutions météorologiques, des universités, des ONG environnementales et des agriculteurs locaux.`)}>
              Partenaires
            </li>
            <li onClick={() => openModal("Engagement climat", `TerraSmart s'engage à sensibiliser le public aux enjeux climatiques et à promouvoir des comportements écoresponsables.`)}>
              Engagement climat
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xl font-medium mb-5">Contact</p>
          <ul className="flex flex-col gap-1 text-gray-600">
            <li>+261 330429156</li>
            <li>TerraSmart@gmail.com</li>
          </ul>
        </div>
      </div>

      <hr />
      <p className="py-5 text-sm text-center">Copyright 2024 @ TerraSmart.com - Tous droits réservés.</p>

      {/* Modale affichée conditionnellement */}
      {modal.visible && (
        <AboutModal
          title={modal.title}
          content={modal.content}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default Footer;
