import axios from "axios";
import type { AxiosError, AxiosResponse } from "axios";
import { clearStoredToken, getStoredToken } from "./authStorage";

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

// Attach the persisted auth token to every outgoing request. Read lazily so the
// header always reflects the latest login/logout without module-level state.
api.interceptors.request.use((config) => {
    const token = getStoredToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// On 401: drop the stale token and bounce to /login (guarding against redirect
// loops when already there). The original error is still rejected so callers can
// surface its message in the UI.
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            clearStoredToken();
            if (typeof window !== "undefined") {
                const { pathname, search } = window.location;
                if (!pathname.startsWith("/login")) {
                    const redirect = encodeURIComponent(pathname + search);
                    window.location.assign(`/login?redirect=${redirect}`);
                }
            }
        }
        return Promise.reject(error);
    }
);