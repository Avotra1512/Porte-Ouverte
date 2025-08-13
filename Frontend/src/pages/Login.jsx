import { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // 🔹 Importer useNavigate
import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa';
import img from "../assets/login.jpg";
import Loginbar from '../components/Loginbar';

const Login = () => {
  const [currentState, setCurrentState] = useState('Inscription');
  const navigate = useNavigate();  // 🔹 Hook pour rediriger

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = currentState === "Connexion" ? "login" : "register";

    const userData = {
      name: currentState === "Connexion" ? "" : e.target.nom?.value,
      email: e.target.email.value,
      password: e.target.password.value,
    };

    try {
      const response = await fetch(`http://127.0.0.1:5000/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message);

        if (currentState === "Connexion") {
          // 🔹 Sauvegarde les infos utilisateur et redirection
          localStorage.setItem("user", JSON.stringify(data.user));
          navigate("/home"); // 🔹 Redirige vers la page d'accueil
        } else {
          setCurrentState("Connexion"); // 🔹 Après inscription, bascule sur connexion
        }
      } else {
        alert("Erreur : " + data.message);
      }
    } catch (error) {
      console.error("Erreur de connexion :", error);
    }
  };

  return (
    <div>
      <Loginbar />
      <form onSubmit={handleSubmit} className='flex flex-col sm:flex-row border rounded-md border-black mx-[7%] my-[4%]'>
        <div className='flex flex-col w-full sm:w-1/2 mx-[7%] my-[7%] mt-14 gap-4 text-black'>
          <div className='inline-flex items-center gap-2 mb-2 mt-10'>
            <p className='prata-regular text-4xl text-green-600'> {currentState} </p>
            <hr className='border-none h-[2.5px] w-20 bg-green-600' />
          </div>

          {currentState === 'Inscription' && (
            <div className='flex items-center border-b-2 border-black'>
              <input name="nom" type="text" className='w-full px-3 py-2 text-black outline-none focus:outline-none' placeholder='Nom' required />
              <FaUser className='text-gray-500 ml-2' />
            </div>
          )}

          <div className='flex items-center border-b-2 border-black'>
            <input name="email" type="email" className='w-full px-3 py-2 text-black outline-none focus:outline-none' placeholder='Email' required />
            <FaEnvelope className='text-gray-500 ml-2' />
          </div>

          <div className='flex items-center border-b-2 border-black'>
            <input name="password" type="password" className='w-full px-3 py-2 text-black outline-none focus:outline-none' placeholder='Mot de passe' required />
            <FaLock className='text-gray-500 ml-2' />
          </div>

          <div className='w-full flex justify-between text-sm text-green-700 mt-[-8px]'>
            <p className='cursor-pointer'>Mot de passe oublié ?</p>
            {currentState === 'Connexion' ? (
              <p onClick={() => setCurrentState('Inscription')} className='cursor-pointer'>Créer un compte</p>
            ) : (
              <p onClick={() => setCurrentState('Connexion')} className='cursor-pointer'>Se connecter à un compte</p>
            )}
          </div>

          <button type="submit" className='bg-green-700 text-white font-light px-20 py-1.5 mt-4 prata-regular text-2xl rounded-full hover:bg-green-600 hover:text-gray-800 hover:border border-white hover:scale-110'>
            {currentState === 'Connexion' ? 'Se connecter' : "S'inscrire"}
          </button>
        </div>

        <img className='w-full sm:w-1/2 rounded-md hover:scale-75' src={img} alt="Login Illustration" />
      </form>
    </div>
  );
}

export default Login;
