import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useDebounce } from "./useDebounce";
import { tripsStore } from "../store/tripsStore";
import {
  createTrip,
  deleteTrip,
  getTrip,
  getTrips,
  updateTrip,
} from "../services/trips.services";
import { toast } from "sonner";
import type { UpdateTripRequest } from "../types/types";
import { modalStore } from "../store/modalStore";
import { getErrorMessage } from "../utils/errors";

export const useTrips = () => {
  const { estado, year, month, page, search } = tripsStore();
  const debouncedSearch = useDebounce(search.trim(), 300);

  return useQuery({
    queryKey: ["trips", estado, year, month, page, debouncedSearch],
    queryFn: () =>
      getTrips(estado ?? "desc", 10, page, month, year, debouncedSearch),
    placeholderData: keepPreviousData,
  });
};

export const useTrip = (id: string) => {
  return useQuery({
    queryKey: ["trip", id],
    queryFn: () => getTrip(id),
    enabled: !!id,
  });
};

export const useCreateTrip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTrip,
    onSuccess: () => {
      toast.success("Reserva añadida correctamente");
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
    onError: (err) => {
      console.error("Error al crear el viaje", err);
    },
  });
};

export const useDeleteTrip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTrip,
    onSuccess: () => {
      toast.success("Reserva elmininada correctamente");
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
  });
};

export const useUpdateTrip = () => {
  const queryClient = useQueryClient();
  const { setIsEdit, setIsOpen } = modalStore();
  const { setTripId } = tripsStore();

  const { mutate: updateTripMutate } = useMutation({
    mutationFn: ({
      tripId,
      dataUpdated,
    }: {
      tripId: string;
      dataUpdated: UpdateTripRequest;
    }) => updateTrip(tripId, dataUpdated),
    onSuccess: (_, variables) => {
      toast.success("Reserva actualizada exitosamente");
      queryClient.invalidateQueries({ queryKey: ["trip", variables.tripId] });
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      setIsEdit(false);
      setIsOpen(true);
      setTripId(variables.tripId);
    },
  });

  return { updateTripMutate };
};

// Para la pantalla Trip (página completa). No usa el estado de los modales viejos.
export const useSaveTrip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tripId,
      dataUpdated,
    }: {
      tripId: string;
      dataUpdated: UpdateTripRequest;
    }) => updateTrip(tripId, dataUpdated),
    onSuccess: (_, variables) => {
      toast.success("Reserva actualizada exitosamente");
      queryClient.invalidateQueries({ queryKey: ["trip", variables.tripId] });
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      // Las finanzas dependen de los valores de la reserva
      queryClient.invalidateQueries({ queryKey: ["finance"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Error al actualizar la reserva"));
    },
  });
};