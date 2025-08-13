import { Link } from "react-router-dom";
import { Search, Bell, User } from "lucide-react"; // Icônes
import img from "../assets/logo.jfif";

const Loginbar = () => {
  return (
    <nav className=" text-black items-center ">
      {/* Première ligne avec logo, recherche et icônes */}
        {/* Logo */}
        <div className="flex items-center space-x-2 sm:max-w-96 m-auto my-8">
          <h1 className="text-4xl font-bold text-green-700">TerraSmart</h1>
          <img src={img} alt="Logo" className="h-20 w-20 rounded-full" />
        </div>
    </nav>
  );
};

export default Loginbar;
