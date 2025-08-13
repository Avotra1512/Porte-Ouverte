import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Alerts from "./pages/Alerts";
import Recommendations from "./pages/Recommendations";
import Simulation from './simulation'
import Analyse from "./pages/Analyse";
import Prediction from "./pages/Prediction";
import Alertes from "./pages/Alertes";
import ProtectedRoute from "./components/ProtectedRoute"; // <-- Ajoute ceci

function App() {
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const hideNavbar = location.pathname === "/" ;

  return (
    <div>
      {!hideNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analyse"
          element={
            <ProtectedRoute>
              <Analyse />
            </ProtectedRoute>
          }
        />
        <Route
          path="/alerts"
          element={
            <ProtectedRoute>
              <Alertes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/prediction"
          element={
            <ProtectedRoute>
              <Prediction />
            </ProtectedRoute>
          }
        />
       
        <Route
          path="/simulation"
          element={
            <ProtectedRoute>
              <Simulation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/simulation/:city"
          element={
            <ProtectedRoute>
              <Simulation />
            </ProtectedRoute>
          }
        />
      </Routes>

      {!hideNavbar && <Footer />}
    </div>
  );
}

export default App;
