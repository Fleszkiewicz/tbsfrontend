import { useQuery } from "@tanstack/react-query";
import { getServices } from "../services/servicesTrip.services";

// Tipos de servicio (aéreo, hotel, ...) para los modales de destino
export const useServices = () => {
  return useQuery({
    queryKey: ["services"],
    queryFn: getServices,
  });
};
