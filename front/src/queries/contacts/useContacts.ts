import {useQuery} from "@tanstack/react-query";
import {api} from "../../config/axios.ts";
import type {Contact} from "../../types/contacts.type.ts";

function useContacts() {
    return useQuery({
        queryKey: ['contacts'],
        queryFn: async (): Promise<Contact[]> => {
            const data = await api.get('/contacts')
            return data.data.contacts
        }
    })
}

export default useContacts
