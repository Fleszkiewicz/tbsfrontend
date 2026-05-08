import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

export const useTrips = () => {
  const { filter, year, month, page } = tripsStore();

  return useQuery({
    queryKey: ["trips", filter, year, month, page],
    queryFn: () => getTrips(filter, 10, page, month, year),
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
  const { year, month, filter, page } = tripsStore.getState();

  return useMutation({
    mutationFn: createTrip,

    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: ["trips", { year, month, filter, page }],
      });

      const previousTrips = queryClient.getQueryData([
        "trips",
        { year, month, filter, page },
      ]);

      return { previousTrips };
    },

    onSuccess: () => {
      toast.success("Reserva añadida correctamente");
      queryClient.invalidateQueries({
        queryKey: ["trips"],
      });
    },

    onError: (err, _, context) => {
      console.error("Error al crear el viaje", err);

      if (context?.previousTrips) {
        queryClient.setQueryData(
          ["trips", { year, month, filter, page }],
          context.previousTrips
        );
      }
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
