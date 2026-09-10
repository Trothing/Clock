import {useMutation, useQueryClient} from "@tanstack/react-query";
import {api} from "../../config/axios.ts";
import type {BlockedUser} from "../../types/blockedUsers.type.ts";

function useUnblockUser() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (userId: number) => {
            await api.delete(`/blocked-users/${userId}`)
            return userId
        },
        onSuccess: (userId) => {
            queryClient.setQueryData<BlockedUser[]>(['blocked-users'], (old = []) =>
                old.filter((b) => b.user.id !== userId))
        }
    })
}

export default useUnblockUser
