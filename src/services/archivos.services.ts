import axios from "axios";
import { api } from "../config/axios";

export type ArchivoApi = {
  id: number;
  nombre: string;
  categoria: string;
  mime: string;
  size: number;
  fecha: string;
};

export type PendingFile = { file: File; categoria: string };

export async function getArchivos(legajo: string): Promise<ArchivoApi[]> {
  const res = await api.get(`/trips/${legajo}/archivos`);
  return res.data.data;
}

/** presign -> PUT directo al bucket -> registro en la base */
export async function uploadArchivo(legajo: string, file: File, categoria: string): Promise<ArchivoApi> {
  const presign = await api.post(`/trips/${legajo}/archivos/presign`, {
    nombre: file.name,
    mime: file.type,
    size: file.size,
    categoria,
  });
  const { url, key, headers } = presign.data.data as {
    url: string;
    key: string;
    headers: Record<string, string>;
  };

  // axios "pelado": el interceptor de `api` agregaria Authorization y rompe la firma de R2
  await axios.put(url, file, { headers });

  const saved = await api.post(`/trips/${legajo}/archivos`, { key, nombre: file.name, categoria });
  return saved.data.data;
}

/** Sube varios archivos de a uno. Nunca lanza: devuelve los nombres de los que fallaron. */
export async function uploadArchivos(legajo: string, items: PendingFile[]): Promise<{ failed: string[] }> {
  const failed: string[] = [];
  for (const { file, categoria } of items) {
    try {
      await uploadArchivo(legajo, file, categoria);
    } catch {
      failed.push(file.name);
    }
  }
  return { failed };
}

export async function getArchivoUrl(
  legajo: string,
  archivoId: number | string,
  disposition: "inline" | "attachment",
): Promise<string> {
  const res = await api.get(`/trips/${legajo}/archivos/${archivoId}/url`, { params: { disposition } });
  return res.data.data.url;
}

export async function deleteArchivo(legajo: string, archivoId: number | string): Promise<void> {
  await api.delete(`/trips/${legajo}/archivos/${archivoId}`);
}
