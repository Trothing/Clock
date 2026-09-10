import {api} from "../../config/axios.ts";
import {useAuthStore} from "../../store/auth.store.ts";
import type {User} from "../../types/user.type.ts";

let refreshPromise: Promise<{accessToken: string, user: User }> | null = null

export async function refreshApi() {
    if (refreshPromise) {
        return refreshPromise
    }

    refreshPromise = (async (): Promise<{accessToken: string, user: User }>  => {
        const { data } = await api.post('/auth/refresh')
        useAuthStore.getState().login(data.user, data.accessToken)
        return data
    })()

    try {
        return await refreshPromise
    } finally {
        refreshPromise = null
    }
}
