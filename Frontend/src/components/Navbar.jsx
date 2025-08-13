import { Link, useNavigate, NavLink } from "react-router-dom";
import { User, LogOut } from "lucide-react"; // Ajoute LogOut
import { useEffect, useState } from "react";
import img from "../assets/logo.jfif";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        setUser(null);
        navigate("/");
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  return (
    <nav className="bg-green-600 text-white shadow-lg">
      <div className="container mx-auto flex justify-between items-center px-6 py-3">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <img src={img} alt="Logo" className="h-10 w-10 rounded-full" />
          <h1 className="text-2xl font-extrabold">TerraSmart</h1>
        </div>
        {/* Icône utilisateur à droite si pas connecté */}
        <div className="flex space-x-5">
          {!user && (
            <Link to="/">
              <User className="cursor-pointer hover:text-yellow-300 transition duration-300" />
            </Link>
          )}
        </div>
      </div>

      {/* Deuxième ligne avec les fonctionnalités */}
      {user && (
        <div className="bg-black py-4 relative">
          <div className="container mx-auto flex justify-center space-x-16">
            <NavLink to="/home" className="flex flex-col items-center gap-1 ">
              <p>Accueil</p>
              <hr className="w-2/4 border-none h-[1.5px] bg-gray-100 hidden" />
            </NavLink>
            <NavLink to="/prediction" className="flex flex-col items-center gap-1">
              <p>Prédiction</p>
              <hr className="w-2/4 border-none h-[1.5px] bg-gray-100 hidden" />
            </NavLink>
            <NavLink to="/simulation" className="flex flex-col items-center gap-1">
              <p>Simulation</p>
              <hr className="w-2/4 border-none h-[1.5px] bg-gray-100 hidden" />
            </NavLink>
            <NavLink to="/analyse" className="flex flex-col items-center gap-1">
              <p>Analyse</p>
              <hr className="w-2/4 border-none h-[1.5px] bg-gray-100 hidden" />
            </NavLink>
            <NavLink to="/alerts" className="flex flex-col items-center gap-1">
              <p>Alertes</p>
              <hr className="w-2/4 border-none h-[1.5px] bg-gray-100 hidden" />
            </NavLink>
          </div>
          {/* Bouton déconnexion en bas à droite */}
          <p
            onClick={handleLogout}
            className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center gap-2 hover:bg-red-700 text-white px-4 py-2 rounded-md transition"
            style={{ minWidth: 0 }}
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden sm:inline">Déconnexion</span>
          </p>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
