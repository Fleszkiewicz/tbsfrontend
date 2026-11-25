import { api, API_URL } from "../config/axios";
import type { CategoriaCancelacion } from "../utils/cancelacion";
import type {
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
    search: string,
    sucursal: "baradero" | "hurlingham" | null = null,
): Promise<TripsApiResponse | undefined> {
    try {
        const params = new URLSearchParams();
        params.append("filter", filter);
        params.append("limit", limit.toString());
        params.append("page", page.toString());

        if (year !== null) params.append("year", year.toString());
        if (month !== null) params.append("month", month.toString());
        if (search) params.append("search", search);
        if (sucursal) params.append("sucursal", sucursal);

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
        const { data } = await api.post<{ data: { id: string } }>(API_ENDPOINT, tripData);
        return data.data.id;
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
        const { data } = await api.patch<{ data: { id: string } }>(`${API_ENDPOINT}/${tripId}`, dataUpdated);
        return data.data.id;
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



export async function cancelTrip(id: string, categoria: CategoriaCancelacion) {
    const { data } = await api.post(`${API_ENDPOINT}/${id}/cancel`, { categoria });
    return data;
}

export async function revertTripCancellation(id: string) {
    const { data } = await api.post(`${API_ENDPOINT}/${id}/revert-cancel`);
    return data;
}