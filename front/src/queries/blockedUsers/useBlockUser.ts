import {useMutation, useQueryClient} from "@tanstack/react-query";
import {api} from "../../config/axios.ts";

function useBlockUser() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (userId: number) => {
            await api.post(`/blocked-users/${userId}`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['blocked-users']})
        }
    })
}

export default useBlockUser
