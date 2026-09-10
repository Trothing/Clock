import {useMutation} from "@tanstack/react-query";
import {api} from "../../config/axios.ts";
import {useAuthStore} from "../../store/auth.store.ts";
import {getErrorMessage} from "../../utils/error.ts";

const useLogout = () => {
    const logoutStore = useAuthStore((state) => state.logout);
    const mutation = useMutation({
        mutationFn: async () => {
            await api.post('/auth/logout')
        },
        onSuccess: () => logoutStore(),
    });

    const logout = async () => {
        try {
            await mutation.mutateAsync();
            return true;
        } catch {
            return false;
        }
    };

    return {
        logout,
        loading: mutation.isPending,
        error: mutation.error ? getErrorMessage(mutation.error, "Logout failed") : null,
    };
};

export default useLogout;
