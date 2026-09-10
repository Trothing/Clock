import {useMutation} from "@tanstack/react-query";
import type {AuthResponse, RegisterFormData} from "../../types/auth.type.ts";
import {api} from "../../config/axios.ts";
import {useAuthStore} from "../../store/auth.store.ts";
import {getErrorMessage} from "../../utils/error.ts";

const useRegister = () => {
    const loginStore = useAuthStore((state) => state.login);
    const mutation = useMutation({
        mutationFn: async (registerData: RegisterFormData) => {
            const {data} = await api.post<AuthResponse>('/auth/register', registerData)
            return data
        },
        onSuccess: (data) => loginStore(data.user, data.accessToken),
    });

    const register = async (registerData: RegisterFormData) => {
        try {
            const data = await mutation.mutateAsync(registerData);
            return data.user;
        } catch {
            return null;
        }
    };

    return {
        register,
        loading: mutation.isPending,
        error: mutation.error ? getErrorMessage(mutation.error, "Registration failed") : null,
    };
};

export default useRegister;
