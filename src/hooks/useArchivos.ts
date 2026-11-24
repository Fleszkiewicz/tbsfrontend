import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteArchivo,
  getArchivos,
  uploadArchivos,
  type PendingFile,
} from "../services/archivos.services";

const key = (legajo: string) => ["archivos", legajo];

export const useArchivos = (legajo: string | undefined) =>
  useQuery({
    queryKey: key(legajo ?? ""),
    queryFn: () => getArchivos(legajo as string),
    enabled: !!legajo,
  });

export const useUploadArchivos = (legajo: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (items: PendingFile[]) => uploadArchivos(legajo, items),
    onSettled: () => qc.invalidateQueries({ queryKey: key(legajo) }),
  });
};

export const useDeleteArchivo = (legajo: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (archivoId: number | string) => deleteArchivo(legajo, archivoId),
    onSuccess: () => qc.invalidateQueries({ queryKey: key(legajo) }),
  });
};
