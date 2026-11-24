import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getDistribucion,
  setSocioAbonado,
  type PagoSocio,
  type Socio,
} from "../services/distribucion.services";

const key = (legajo: string) => ["distribucion", legajo];

export const useDistribucion = (legajo: string | undefined) =>
  useQuery({
    queryKey: key(legajo ?? ""),
    queryFn: () => getDistribucion(legajo as string),
    enabled: !!legajo,
  });

/** Marca/desmarca con respuesta inmediata en pantalla; si el servidor falla, vuelve atrás */
export const useToggleSocio = (legajo: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ socio, abonado }: { socio: Socio; abonado: boolean }) =>
      setSocioAbonado(legajo, socio, abonado),
    onMutate: async ({ socio, abonado }) => {
      await qc.cancelQueries({ queryKey: key(legajo) });
      const previous = qc.getQueryData<PagoSocio[]>(key(legajo)) ?? [];
      const next = abonado
        ? [...previous.filter((p) => p.socio !== socio), { socio, monto_ars: 0, monto_usd: 0, fecha: "" }]
        : previous.filter((p) => p.socio !== socio);
      qc.setQueryData(key(legajo), next);
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx) qc.setQueryData(key(legajo), ctx.previous);
    },
    onSuccess: (data) => qc.setQueryData(key(legajo), data),
  });
};
