import {useMutation} from "@tanstack/react-query";
import type {AuthResponse, LoginFormData} from "../../types/auth.type.ts";
import {api} from "../../config/axios.ts";
import {useAuthStore} from "../../store/auth.store.ts";
import {getErrorMessage} from "../../utils/error.ts";

const useLogin = () => {
    const loginStore = useAuthStore((state) => state.login);
    const mutation = useMutation({
        mutationFn: async (loginData: LoginFormData) => {
            const {data} = await api.post<AuthResponse>('/auth/login', loginData)
            return data
        },
        onSuccess: (data) => loginStore(data.user, data.accessToken),
    });

    const login = async (loginData: LoginFormData) => {
        try {
            const data = await mutation.mutateAsync(loginData);
            return data.user;
        } catch {
            return null;
        }
    };

    return {
        login,
        loading: mutation.isPending,
        error: mutation.error ? getErrorMessage(mutation.error, "Login failed") : null,
    };
};

export default useLogin;
