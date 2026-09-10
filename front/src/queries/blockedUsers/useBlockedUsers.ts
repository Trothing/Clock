import {useQuery} from "@tanstack/react-query";
import {api} from "../../config/axios.ts";
import type {BlockedUser} from "../../types/blockedUsers.type.ts";

function useBlockedUsers() {
    return useQuery({
        queryKey: ['blocked-users'],
        queryFn: async (): Promise<BlockedUser[]> => {
            const data = await api.get('/blocked-users')
            return data.data.blockedUsers
        }
    })
}

export default useBlockedUsers
