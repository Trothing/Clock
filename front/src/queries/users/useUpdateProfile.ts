import {useMutation, useQueryClient} from "@tanstack/react-query";
import {api} from "../../config/axios.ts";
import {useAuthStore} from "../../store/auth.store.ts";
import type {User, UpdateProfileFormData} from "../../types/user.type.ts";

function useUpdateProfile() {
    const queryClient = useQueryClient()
    const setUser = useAuthStore((state) => state.setUser)

    return useMutation({
        mutationFn: async (data: UpdateProfileFormData) => {
            const response = await api.patch<User>('/users/me', data)
            return response.data
        },
        onSuccess: (user) => {
            setUser(user)
            queryClient.invalidateQueries({queryKey: ['chats']})
        }
    })
}

export default useUpdateProfile
