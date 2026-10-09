import { useEffect, type ReactNode } from "react";
import { useUser } from "../hooks/useUser";
import { useToken } from "../hooks/useToken";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { setUser, setLoading } = useUser();
  const { setToken } = useToken();

  useEffect(() => {
    const savedUser = sessionStorage.getItem("user");
    const savedToken = sessionStorage.getItem("token");
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
    setLoading(false);
  }, [setLoading, setToken, setUser]);

  return <>{children}</>;
};
