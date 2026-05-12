import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { decodeToken } from "../utils/utils";
import { useUser } from "../hooks/useUser";
import { useToken } from "../hooks/useToken";
import { Loader } from "../common/ui/Loader";

export const AuthSuccess = () => {
  const { setUser } = useUser();
  const { setToken } = useToken();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    import("./Home");
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    if (token) {
      setToken(token);
      const payload = decodeToken(token);
      if (payload) {
        const user = {
          auth: payload.auth,
          nombre: payload.nombre,
          email: payload.email,
          avatar: payload.avatar,
        };
        setUser(user);
      }
      navigate("/home");
    }
  }, [location.search, navigate, setToken, setUser]);
  return <Loader text="Iniciando sesión..." />;
};
