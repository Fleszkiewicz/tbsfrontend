import { api, API_URL } from "../config/axios";
import type { PasajeroBusqueda } from "../types/types";

const API_ENDPOINT = `${API_URL}/pasajeros`;

export async function buscarPasajerosPorDni(dni: string): Promise<PasajeroBusqueda[]> {
    const { data } = await api.get<{ data: PasajeroBusqueda[] }>(API_ENDPOINT, {
        params: { dni },
    });
    return data.data;
}