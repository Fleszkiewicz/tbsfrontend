import { useState, useRef, useEffect } from "react";
import { logOut } from "../services/auth.services";
import { useNavigate, NavLink } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import Swal from "sweetalert2";
import { IoHomeOutline, IoReceiptOutline, IoPieChartOutline, IoChevronDown } from "react-icons/io5";
import { FiDollarSign, FiUser } from "react-icons/fi";
import { LuLogOut } from "react-icons/lu";

function Navbar() {
  const navigate = useNavigate();
  const { clearUser, user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogOut = async () => {
    clearUser();
    sessionStorage.clear();
    await logOut();
    navigate("/login");
  };

  const handleLogoutClick = async () => {
    const result = await Swal.fire({
      title: "¿Cerrar sesión?",
      text: "Tendrás que volver a ingresar tus datos para acceder.",
      showCancelButton: true,
      confirmButtonText: "Cerrar sesión",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
      buttonsStyling: false,
      customClass: {
        popup: "rounded-[24px] p-6 shadow-xl",
        title: "text-[20px] font-semibold text-black mt-2",
        htmlContainer: "text-[14px] text-gray-500 font-medium mt-2 mb-6",
        actions: "flex w-full gap-3",
        confirmButton: "flex-1 bg-[#FF3B30] hover:bg-[#E3342B] text-white font-semibold py-3 rounded-full transition-colors",
        cancelButton: "flex-1 bg-[#e8e8e8] hover:bg-[#dcdcdc] text-black font-semibold py-3 rounded-full transition-colors"
      }
    });

    if (result.isConfirmed) {
      handleLogOut();
    }
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center justify-center gap-2 px-3 md:px-6 py-2 text-sm font-semibold transition-all duration-200 rounded-full ${isActive ? "bg-black text-white" : "bg-transparent text-gray-500 hover:text-black hover:bg-gray-100"
    }`;

  return (
    <>
      <div className="fixed top-0 left-0 w-full z-[500] px-4 md:px-10 py-2.5 flex items-center justify-between bg-white/90 backdrop-blur-md border-b border-gray-200/80">
        {/* Izquierda: Perfil de Usuario */}
        <div
          className="flex items-center gap-2.5 cursor-pointer select-none group"
          onClick={() => navigate("/home")}
        >
          <img
            src="https://res.cloudinary.com/dttpgbmdx/image/upload/v1752706284/tbs-logo_frbbyo.png"
            alt="The Black Sheep Logo"
            className="w-8 h-8 md:w-12 md:h-12 object-contain"
          />
          <div className="hidden md:flex flex-col items-start leading-tight">
            <span className="text-[17px] font-bold text-black tracking-tight group-hover:opacity-80 transition-opacity">
              TheBlackSheep
            </span>
            <span className="text-[10px] text-gray-500 font-medium -mt-0.5 ml-0.5">
              Conocemos tu destino.
            </span>
          </div>
        </div>
        {/* Centro: Navegación */}
        <nav className="flex items-center gap-1 md:gap-2">
          <NavLink to="/home" className={navLinkClass}>
            <IoHomeOutline size={20} />
            <span className="hidden md:inline">Home</span>
          </NavLink>
          <NavLink to="/finance" className={navLinkClass}>
            <FiDollarSign size={20} />
            <span className="hidden md:inline">Finanzas</span>
          </NavLink>
          <NavLink to="/expenses" className={navLinkClass}>
            <IoReceiptOutline size={20} />
            <span className="hidden md:inline">Expensas</span>
          </NavLink>
          <NavLink to="/dashboard" className={navLinkClass}>
            <IoPieChartOutline size={20} />
            <span className="hidden md:inline">Estadisticas</span>
          </NavLink>
        </nav>

        {/* Derecha: Notificaciones / Actions */}
        <div className="flex items-center justify-end">
          <div className="relative" ref={dropdownRef}>
            <div
              className="flex items-center gap-3 cursor-pointer select-none p-1 rounded-2xl transition-all duration-200 group"
              onClick={() => setIsOpen(!isOpen)}
            >
              <div className="hidden md:flex flex-col items-end leading-tight ml-2">
                <span className="text-[13px] font-semibold text-black capitalize">
                  {user?.nombre || "Usuario"}
                </span>
                <span className="text-[11px] text-gray-500 font-medium mt-0.5">
                  {/* {user?.email} */}
                  Sesion activa.
                </span>
              </div>
              <div className="w-7 h-7 md:w-10 md:h-10 rounded-full bg-black flex items-center justify-center overflow-hidden flex-shrink-0 text-white shadow-sm">
                {user?.avatar ? (
                  <img className="w-full h-full object-cover" src={user.avatar} alt="Avatar" />
                ) : (
                  <FiUser className="w-3 h-3  md:w-5 md:h-5" />
                )}
              </div>
              <IoChevronDown
                className={`w-3 h-3 -ml-2 -mr-3 md:-mr-1 md:ml-1 md:w-4 md:h-4 text-gray-400 hover:text-black transition-transform duration-300 mr-1 ${isOpen ? "rotate-180" : ""}`}
                size={16}
              />
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-[24px] shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-[100]">
                <div className="p-6 flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center overflow-hidden mb-3 shadow-md">
                    {user?.avatar ? (
                      <img className="w-full h-full object-cover" src={user.avatar} alt="Avatar" />
                    ) : (
                      <FiUser size={20} className="text-white" />
                    )}
                  </div>
                  <h3 className="text-[15px] font-bold text-black capitalize">
                    {user?.nombre || "Usuario"}
                  </h3>
                  <p className="text-[12px] text-gray-500 font-medium truncate w-full px-2">
                    {user?.email}
                  </p>
                </div>

                <div className="h-px bg-gray-100 mx-4" />

                <div className="p-2">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      handleLogoutClick();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 text-[13px] font-semibold text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <LuLogOut size={16} />
                    Cerrar sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Navbar;
