import { api, API_URL } from "../config/axios";
import type { ServiceApiResponse } from "../types/types";

const API_ENDPOINT = `${API_URL}/services`;

export async function getServices(): Promise<ServiceApiResponse | null> {
  const { data } = await api.get<ServiceApiResponse>(`${API_ENDPOINT}`);
  return data;
}
