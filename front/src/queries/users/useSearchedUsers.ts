import {useQuery} from "@tanstack/react-query";
import {api} from "../../config/axios.ts";
import type {GetSearchedUsersResponse} from "../../types/user.type.ts";

function useSearchedUsers (searchTerm: string, limit?: number) {
    return useQuery({
        queryKey: ['searched-users', searchTerm],
        queryFn: async () => {
            const payload: {search: string, limit?: number} = {search: searchTerm}
            if (limit) payload.limit = limit
            const {data} = await api.post<GetSearchedUsersResponse>('/users/search-user-by-username', payload)
            return data.users
        },
        enabled: !!searchTerm && searchTerm.length !== 0
    })
}

export default useSearchedUsers
