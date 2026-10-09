import { Outlet } from "react-router-dom";
import Navbar from "../layout/Navbar";

export const ProtectedLayout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
};
