import {useMutation, useQueryClient} from "@tanstack/react-query";
import {api} from "../../config/axios.ts";

function useAddContact() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (contactUserId: number) => {
            await api.post('/contacts', {contactUserId})
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['contacts']})
        }
    })
}

export default useAddContact
