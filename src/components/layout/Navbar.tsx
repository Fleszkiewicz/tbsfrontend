import { logOut } from "../services/auth.services";
import { useNavigate, NavLink } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import Swal from "sweetalert2";
import { IoHomeOutline, IoReceiptOutline, IoLogOutOutline } from "react-icons/io5";
import { FiDollarSign, FiUser } from "react-icons/fi";

function Navbar() {
  const navigate = useNavigate();
  const { clearUser, user } = useUser();

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
      <div className="fixed top-0 left-0 w-full z-50 px-4 md:px-10 py-3 flex items-center justify-between bg-white/90 backdrop-blur-md border-b border-gray-200/80">
        {/* Izquierda: Perfil de Usuario */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-black flex items-center justify-center overflow-hidden flex-shrink-0 text-white">
            {user?.avatar ? (
              <img className="w-full h-full object-cover" src={user.avatar} alt="Avatar" />
            ) : (
              <FiUser className="w-4 h-4 md:w-5 md:h-5" />
            )}
          </div>
          <span className="hidden md:inline text-sm font-medium text-black capitalize">
            Hola, {user?.nombre || "Usuario"}!
          </span>
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
        </nav>

        {/* Derecha: Notificaciones / Actions */}
        <div className="flex items-center justify-end">
          <button
            onClick={handleLogoutClick}
            className="flex items-center gap-2 px-3 md:px-4 py-2 text-[13px] font-semibold text-gray-500 hover:text-black hover:bg-gray-100 rounded-full transition-all duration-200 "
          >
            <span className="hidden md:inline">Cerrar sesión</span>
            <IoLogOutOutline size={20} strokeWidth={2} />
          </button>
        </div>
      </div>
    </>
  );
}


export default Navbar;
