import { api, API_URL } from "../config/axios";
import type {
  CreateTripResponse,
  UpdateDeleteTripResponse,
  UpdateTripRequest,
  CreateTripRequest,
  TripsApiResponse,
  TripApiResponse,
} from "../types/types";

const API_ENDPOINT = `${API_URL}/trips`;

export async function getTrips(
  filter: string,
  limit: number,
  page: number,
  month: number | null,
  year: number | null,
  search: string
): Promise<TripsApiResponse | undefined> {
  try {
    const params = new URLSearchParams();
    params.append("filter", filter);
    params.append("limit", limit.toString());
    params.append("page", page.toString());

    if (year !== null) params.append("year", year.toString());
    if (month !== null) params.append("month", month.toString());
    if (search) params.append("search", search);

    const { data } = await api.get<TripsApiResponse>(
      `${API_ENDPOINT}?${params.toString()}`
    );
    return data;
  } catch (error) {
    console.error("Error al obtener los viajes", error);
    throw error;
  }
}

export async function getTrip(id: string): Promise<TripApiResponse | null> {
  try {
    const { data } = await api.get<TripApiResponse>(`${API_ENDPOINT}/${id}`);

    return data;
  } catch (error) {

    throw error;
  }
}

export async function createTrip(
  tripData: CreateTripRequest
): Promise<string | null> {
  try {
    const { data } = await api.post<CreateTripResponse>(API_ENDPOINT, tripData);

    return data.trip;
  } catch (error) {
    console.error("Error al crear el viaje", error);
    throw error;
  }
}

export async function updateTrip(
  tripId: string,
  dataUpdated: UpdateTripRequest
) {
  try {
    const { data } = await api.patch<UpdateDeleteTripResponse>(
      `${API_ENDPOINT}/${tripId}`,
      dataUpdated
    );
    return data.trip;
  } catch (error) {

    throw error;
  }
}

export async function deleteTrip(id: string) {
  try {
    const { data } = await api.delete<UpdateDeleteTripResponse>(
      `${API_ENDPOINT}/${id}`
    );
    return data;
  } catch (error) {

    throw error;
  }
}
