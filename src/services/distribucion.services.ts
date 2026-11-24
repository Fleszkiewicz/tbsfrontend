import { api } from "../config/axios";

export type Socio = "pablo" | "soledad" | "mariana";

export type PagoSocio = {
  socio: Socio;
  monto_ars: number;
  monto_usd: number;
  fecha: string;
};

export async function getDistribucion(legajo: string): Promise<PagoSocio[]> {
  const res = await api.get(`/trips/${legajo}/distribucion`);
  return res.data.data;
}

export async function setSocioAbonado(legajo: string, socio: Socio, abonado: boolean): Promise<PagoSocio[]> {
  const res = await api.put(`/trips/${legajo}/distribucion/${socio}`, { abonado });
  return res.data.data;
}
