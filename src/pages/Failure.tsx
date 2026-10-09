import { useNavigate } from "react-router-dom";
import { IoArrowBack, IoAlertCircle } from "react-icons/io5";

const BG_IMAGE =
  "https://res.cloudinary.com/dttpgbmdx/image/upload/v1768442836/bg_login_dqbrvl.png";
const LOGO =
  "https://res.cloudinary.com/dttpgbmdx/image/upload/v1752706284/tbs-logo_frbbyo.png";

export const Failure = () => {
  const navigate = useNavigate();

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Fondo con imagen y blur */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-110"
        style={{ backgroundImage: `url('${BG_IMAGE}')` }}
      />
      {/* Overlay oscuro degradado */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/45 to-black/75" />
      {/* Blur ambiental */}
      <div className="absolute inset-0 backdrop-blur-[2px]" />

      {/* Card central estilo iOS Sheet */}
      <div className="relative z-10 w-full max-w-sm mx-4">
        {/* Logo flotante sobre el card */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-[28px] bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            <img
              src={LOGO}
              alt="The Black Sheep Logo"
              className="w-16 h-16 object-contain drop-shadow-lg"
            />
          </div>
        </div>

        {/* Texto del error */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight drop-shadow-lg">
            The Black Sheep
          </h1>
          <p className="text-white/70 text-[15px] font-medium mt-1.5 tracking-wide">
            Conocemos tu destino.
          </p>
        </div>

        {/* Card glassmorphism de error */}
        <div className="bg-white/[0.12] backdrop-blur-xl border border-white/20 rounded-[28px] p-7 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          {/* Ícono de error */}
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-full bg-red-500/20 border border-red-400/30 flex items-center justify-center">
              <IoAlertCircle className="text-red-400" size={32} />
            </div>
          </div>

          <h2 className="text-white font-semibold text-[17px] text-center mb-2">
            Acceso denegado
          </h2>
          <p className="text-white/60 text-[13px] text-center leading-relaxed mb-6">
            El correo electrónico ingresado no tiene autorización. Por favor,
            usá una cuenta habilitada para acceder.
          </p>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="group w-full flex items-center justify-center gap-2 bg-white hover:bg-white/95 active:scale-[0.97] text-[#1D1D1F] font-semibold text-[15px] py-3.5 px-5 rounded-[14px] transition-all duration-200 shadow-[0_4px_16px_rgba(0,0,0,0.25)] select-none"
          >
            <IoArrowBack size={18} className="flex-shrink-0 group-hover:-translate-x-0.5 transition-transform" />
            Volver a iniciar sesión
          </button>
        </div>
      </div>
    </section>
  );
};
