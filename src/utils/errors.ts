import { isAxiosError } from "axios";

// El backend responde { error: "mensaje" } cuando algo falla
export const getErrorMessage = (error: unknown, fallback: string): string => {
    if (isAxiosError(error) && typeof error.response?.data?.error === "string") {
        return error.response.data.error;
    }
    return fallback;
};