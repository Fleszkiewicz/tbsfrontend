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
  cancelTrip,
  revertTripCancellation,
} from "../services/trips.services";
import { toast } from "sonner";
import type { UpdateTripRequest } from "../types/types";
import { modalStore } from "../store/modalStore";


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

export const useTrip = (id: string) =>
  useQuery({
    queryKey: ["trip", id],
    queryFn: () => getTrip(id),
    enabled: !!id,
    refetchOnWindowFocus: false, // evita pisar lo que el usuario está editando
  });

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

export const useSaveTrip = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tripId, dataUpdated }: { tripId: string; dataUpdated: UpdateTripRequest }) =>
      updateTrip(tripId, dataUpdated),
    onSuccess: (_, { tripId }) => {
      toast.success("Cambios guardados");
      queryClient.invalidateQueries({ queryKey: ["trip", tripId] });
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || "Error al guardar los cambios");
    },
  });
};

const getErrorMessage = (error: any, fallback: string) =>
  error?.response?.data?.error || fallback;

export const useCancelTrip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tripId, motivo }: { tripId: string; motivo: string }) =>
      cancelTrip(tripId, motivo),
    onSuccess: (_, variables) => {
      toast.success("Reserva cancelada");
      queryClient.invalidateQueries({ queryKey: ["trip", variables.tripId] });
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      queryClient.invalidateQueries({ queryKey: ["finance"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "No se pudo cancelar la reserva"));
    },
  });
};

export const useRevertCancelTrip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tripId: string) => revertTripCancellation(tripId),
    onSuccess: (_, tripId) => {
      toast.success("Cancelación anulada");
      queryClient.invalidateQueries({ queryKey: ["trip", tripId] });
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      queryClient.invalidateQueries({ queryKey: ["finance"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "No se pudo anular la cancelación"));
    },
  });
};

