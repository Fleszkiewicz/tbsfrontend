import { FcGoogle } from "react-icons/fc";
import { API_URL } from "../config/axios";

const BG_IMAGE =
  "https://res.cloudinary.com/dttpgbmdx/image/upload/v1768442836/bg_login_dqbrvl.png";
const LOGO =
  "https://res.cloudinary.com/dttpgbmdx/image/upload/v1752706284/tbs-logo_frbbyo.png";

function Login() {
  const handleLogin = async () => {
    window.location.href = `${API_URL}/auth/callback`;
  };

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Fondo con imagen y blur */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-110"
        style={{ backgroundImage: `url('${BG_IMAGE}')` }}
      />
      {/* Overlay oscuro degradado */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/70" />
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

        {/* Texto de bienvenida */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight drop-shadow-lg">
            The Black Sheep
          </h1>
          <p className="text-white/70 text-[15px] font-medium mt-1.5 tracking-wide">
            Conocemos tu destino.
          </p>
        </div>

        {/* Card glassmorphism */}
        <div className="bg-white/[0.12] backdrop-blur-xl border border-white/20 rounded-[28px] p-7 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <p className="text-white/60 text-[13px] font-medium text-center mb-5 tracking-wide uppercase">
            Acceso interno
          </p>

          <button
            type="button"
            onClick={handleLogin}
            className="group w-full flex items-center justify-center gap-3 bg-white hover:bg-white/95 active:scale-[0.97] text-[#1D1D1F] font-semibold text-[15px] py-3.5 px-5 rounded-[14px] transition-all duration-200 shadow-[0_4px_16px_rgba(0,0,0,0.25)] select-none"
          >
            <FcGoogle size={22} className="flex-shrink-0" />
            Iniciar sesión con Google
          </button>

          <p className="text-white/35 text-[11px] text-center mt-5 font-medium leading-relaxed">
            Solo cuentas autorizadas tienen acceso.
          </p>
        </div>
      </div>
    </section>
  );
}

export default Login;
