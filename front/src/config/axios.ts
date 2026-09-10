import axios from "axios";
import {env} from "./env.ts";
import {useAuthStore} from "../store/auth.store.ts";
import {refreshApi} from "../apis/auth/auth.api.ts";


declare module 'axios' {
    export interface InternalAxiosRequestConfig {
        _retry?: boolean
    }
}

export const api = axios.create({
    baseURL: env.VITE_API_URL,
    withCredentials: true,
})
api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken

    if(token){
        config.headers.Authorization = `Bearer ${token}`
    }

    return config
})

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config
        const isAuthRequest = originalRequest?.url?.includes('/auth/')

        if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthRequest) {
            originalRequest._retry = true

            try {
                await refreshApi()
                return api(originalRequest)
            } catch (refreshError) {
                useAuthStore.getState().logout()
                return Promise.reject(refreshError)
            }
        }

        return Promise.reject(error)
    }
)