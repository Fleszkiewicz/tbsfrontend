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
import type { CategoriaCancelacion } from "../utils/cancelacion";


export const useTrips = () => {
  const { estado, year, month, page, search, sucursal } = tripsStore();
  const debouncedSearch = useDebounce(search.trim(), 300);

  return useQuery({
    queryKey: ["trips", estado, year, month, page, debouncedSearch, sucursal],
    queryFn: () =>
      getTrips(estado ?? "desc", 10, page, month, year, debouncedSearch, sucursal),
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
      toast.success("Expediente creado correctamente", { id: "trip-create" });
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
      toast.success("Expediente eliminado correctamente", { id: "trip-delete" });
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || "No se pudo eliminar el expediente", { id: "trip-delete" });
    },
  });
};

export const useSaveTrip = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tripId, dataUpdated }: { tripId: string; dataUpdated: UpdateTripRequest }) =>
      updateTrip(tripId, dataUpdated),
    onSuccess: (_, { tripId }) => {
      toast.success("Expediente guardado correctamente", { id: "trip-save" });
      queryClient.invalidateQueries({ queryKey: ["trip", tripId] });
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || "Error al guardar el expediente", { id: "trip-save" });
    },
  });
};

const getErrorMessage = (error: any, fallback: string) =>
  error?.response?.data?.error || fallback;

export const useCancelTrip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tripId, categoria }: { tripId: string; categoria: CategoriaCancelacion }) =>
      cancelTrip(tripId, categoria),
    onSuccess: (_, variables) => {
      toast.success("Expediente cancelado", { id: "trip-cancel" });
      queryClient.invalidateQueries({ queryKey: ["trip", variables.tripId] });
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      queryClient.invalidateQueries({ queryKey: ["finance"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "No se pudo cancelar el expediente"), { id: "trip-cancel" });
    },
  });
};

export const useRevertCancelTrip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tripId: string) => revertTripCancellation(tripId),
    onSuccess: (_, tripId) => {
      toast.success("Cancelación anulada", { id: "trip-cancel" });
      queryClient.invalidateQueries({ queryKey: ["trip", tripId] });
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      queryClient.invalidateQueries({ queryKey: ["finance"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "No se pudo anular la cancelación"), { id: "trip-cancel" });
    },
  });
};

