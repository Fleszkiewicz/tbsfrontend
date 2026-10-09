import { api, API_URL } from "../config/axios";
import type {
  CreateServiceTripData,
  ServiceApiResponse,
  UpdateServiceData,
} from "../types/types";

const API_ENDPOINT = `${API_URL}/services`;

export async function getServices(): Promise<ServiceApiResponse | null> {
  const { data } = await api.get<ServiceApiResponse>(`${API_ENDPOINT}`);
  return data;
}

export async function createServiceForTrip(serviceData: CreateServiceTripData) {
  const { data } = await api.post(`${API_ENDPOINT}`, serviceData);
  return data;
}

export async function deleteServiceForTrip(serviceId: number, tripId: string) {
  const { data } = await api.delete(
    `${API_ENDPOINT}/${serviceId}/trip/${tripId}`
  );
  return data;
}

export async function updateServiceForTrip(
  serviceId: number,
  tripId: string,
  dataUpdated: UpdateServiceData
) {
  const { data } = await api.put(
    `${API_ENDPOINT}/${serviceId}/trip/${tripId}`,
    dataUpdated
  );
  return data;
}
