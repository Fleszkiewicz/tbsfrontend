import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createServiceForTrip,
  deleteServiceForTrip,
  getServices,
  updateServiceForTrip,
} from "../services/servicesTrip.services";
import { toast } from "sonner";
import type { CreateServiceTripData, UpdateServiceData } from "../types/types";

export const useServices = () => {
  return useQuery({
    queryKey: ["services"],
    queryFn: getServices,
  });
};

export const useCreateServices = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createServiceForTrip,
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: ["trips"],
      });
    },
  });
};

export const useDeleteService = () => {
  const queryClient = useQueryClient();
  const { mutate: deleteServiceMutate } = useMutation({
    mutationFn: ({
      serviceId,
      tripId,
    }: {
      serviceId: number;
      tripId: string;
    }) => deleteServiceForTrip(serviceId, tripId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["trip", variables.tripId] });
      queryClient.invalidateQueries({ queryKey: ["trips"] });

      toast.success("Servicio eliminado correctamente");
    },
    onError: () => {
      toast.error("Error al eliminar el servicio");
    },
  });

  return { deleteServiceMutate };
};

export const useCreateService = () => {
  const queryClient = useQueryClient();
  const { mutate: createServiceMutate } = useMutation({
    mutationFn: (serviceData: CreateServiceTripData) =>
      createServiceForTrip(serviceData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["trip", variables.viaje_id] });
      queryClient.invalidateQueries({ queryKey: ["trips"] });

      toast.success("Servicio añadido correctamente");
    },
  });

  return { createServiceMutate };
};

export const useUpdateService = () => {
  const queryClient = useQueryClient();

  const { mutate: updateServiceMutate } = useMutation({
    mutationFn: ({
      tripId,
      serviceId,
      dataUpdated,
    }: {
      tripId: string;
      serviceId: number;
      dataUpdated: UpdateServiceData;
    }) => updateServiceForTrip(serviceId, tripId, dataUpdated),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["trip", variables.tripId] });
      queryClient.invalidateQueries({ queryKey: ["trips"] });

      toast.success("Servicio actualizado exitosamente");
    },
  });

  return { updateServiceMutate };
};
