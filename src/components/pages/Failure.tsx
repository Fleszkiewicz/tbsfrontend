import { useNavigate, useSearchParams } from "react-router-dom";
import { IoIosArrowRoundBack } from "react-icons/io";

export const Failure = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rejectedEmail = searchParams.get("email");

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center relative bg-[url('https://res.cloudinary.com/dttpgbmdx/image/upload/v1768442836/bg_login_dqbrvl.png')]">
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
        <h3 className="text-xl font-normal mb-2 text-white/90 text-center drop-shadow-sm">
          Correo electrónico no autorizado
        </h3>
        {rejectedEmail ? (
          <p className="text-sm font-medium mb-6 text-white/80 text-center bg-black/30 p-2.5 rounded-sm border border-white/10 w-full break-all">
            La cuenta <span className="text-yellow-300 font-semibold">{rejectedEmail}</span> no se encuentra registrada en el sistema.
          </p>
        ) : (
          <p className="text-sm font-medium mb-6 text-white/80 text-center">
            Volvé a iniciar sesión con un correo autorizado.
          </p>
        )}
        <button
          onClick={() => navigate("/login")}
          className="bg-orange-500 py-2 px-6 font-semibold text-white flex rounded-sm items-center gap-1 transition duration-200 backdrop-blur hover:bg-orange-600"
        >
          <IoIosArrowRoundBack size={30} />
          Volver a iniciar sesión
        </button>
      </div>
    </div>
  );
};
