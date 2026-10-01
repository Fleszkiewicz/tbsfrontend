import { FcGoogle } from "react-icons/fc";
import { API_URL } from "../config/axios";

function Login() {
  const handleLogin = async () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-cover bg-center relative bg-[url('https://res.cloudinary.com/dttpgbmdx/image/upload/v1768442836/bg_login_dqbrvl.png')]">
      <div className="absolute inset-0 bg-black opacity-40 z-0"></div>

      <div className="relative z-10 bg-white/20 backdrop-blur-sm shadow-lg p-16 rounded-sm w-full max-w-lg flex flex-col items-center">
        <img
          src="https://res.cloudinary.com/dttpgbmdx/image/upload/v1752706284/tbs-logo_frbbyo.png"
          alt="logo"
          className="h-40 mx-auto mb-10 drop-shadow"
        />

        <h1 className="text-4xl font-bold mb-2 text-white text-center drop-shadow">
          The Black Sheep
        </h1>
        <h2 className="text-xl font-normal mb-6 text-white/90 text-center drop-shadow-sm">
          Conocemos tu destino.
        </h2>

        <button
          type="button"
          className="flex items-center justify-center gap-3 w-[330px] border border-red-700 rounded-sm py-2 px-4 bg-red-600 hover:bg-red-700 transition duration-200 text-sm text-white font-semibold shadow-sm backdrop-blur"
          onClick={() => handleLogin()}
        >
          <FcGoogle size={28} />
          Iniciar sesión con Google
        </button>
      </div>
    </section>
  );
}

export default Login;
