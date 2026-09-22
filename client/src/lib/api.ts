import axios from "axios";
import type { AxiosResponse } from "axios";

export const API_BASE_URL =
    (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:3000/api/v1";

export const api = axios.create({ baseURL: API_BASE_URL });

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
}

export const unwrap = async <T>(
    promise: Promise<AxiosResponse<ApiResponse<T>>>
): Promise<T> => {
    const response = await promise;
    return response.data.data;
};