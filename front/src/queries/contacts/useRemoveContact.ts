import {useMutation, useQueryClient} from "@tanstack/react-query";
import {api} from "../../config/axios.ts";
import type {Contact} from "../../types/contacts.type.ts";

function useRemoveContact() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (contactUserId: number) => {
            await api.delete(`/contacts/${contactUserId}`)
            return contactUserId
        },
        onSuccess: (contactUserId) => {
            queryClient.setQueryData<Contact[]>(['contacts'], (old = []) =>
                old.filter((c) => c.user.id !== contactUserId))
        }
    })
}

export default useRemoveContact
