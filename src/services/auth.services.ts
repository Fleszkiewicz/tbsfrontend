import { api, API_URL } from "../config/axios";
import type { GetAccessTokenResponse, LogOutResponse } from "../types/types";

const API_ENDPOINT = `${API_URL}/auth`;

export async function generateAccessToken(): Promise<GetAccessTokenResponse> {
  try {
    const { data } = await api.post<GetAccessTokenResponse>(
      `${API_ENDPOINT}/refresh`
    );
    return data;
  } catch (error) {

  }
  return { accessToken: "" };
}
export async function logOut(): Promise<LogOutResponse> {
  try {
    const { data } = await api.post<LogOutResponse>(`${API_ENDPOINT}/logout`);
    return data;
  } catch (error) {

  }
  return { message: "" };
}
