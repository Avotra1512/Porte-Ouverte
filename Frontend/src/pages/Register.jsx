import { useState } from "react";
import { Link } from "react-router-dom";
import img from "../assets/images.jpeg";
//import axios from "axios";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  //const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
   /* try {
      await axios.post("http://127.0.0.1:8000/api/register/", {
        username,
        email,
        password,
      });
      alert("Inscription réussie !");
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError("Erreur lors de l'inscription");
    } */
  };

  return (
    <div className="flex  justify-items-center w-full">
      <div className="w-1/2 ">
              <img src={img} className="object-cover w-full h-full" alt="" />
            </div>
    <div className="w-1/2 h-screen  flex flex-col justify-center  bg-white-100 p-8 ">
    <div className="w-full flex flex-col max-w-[550px]">
        <h2 className="text-3xl font-semibold  text-[#2C3E50]">Inscription</h2>
        <p className="text-base mb-2">
            Bienvenue ! Veuillez remplir votre formulaire
          </p>
        <form className="mt-4" onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Nom d'utilisateur"
            className="w-full text-black py-4 my-2 border-b border-black outline-none focus:outline-none"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full text-black py-4 my-2 border-b border-black outline-none focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Mot de passe"
            className="w-full text-black py-4 my-2 border-b border-black outline-none focus:outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
            <div className="w-full flex flex-col my-4">
              <button className="w-full  bg-[#2C3E50] text-white rounded-full p-3.5 my-2 text-center flex items-center justify-center hover:bg-[#566F77]">
                S&apos;inscrire
              </button>
              <Link to="/login">
              <button  className="w-full  bg-[#fafbfc] text-[#2C3E50] border border-[#2C3E50] rounded-full p-3.5 my-2 text-center flex items-center justify-center hover:bg-[#566F77] hover:text-white">
                 Se connecter
              </button>
              </Link>
            </div>
            </form>
      </div>
      </div>
    </div>
    
  );
};

export default Register;
