import {useQuery} from "@tanstack/react-query";
import {api} from "../../config/axios.ts";
import type {GetPrivacySettingsResponse, PrivacySettings} from "../../types/privacySettings.type.ts";

function usePrivacySettings() {
    return useQuery({
        queryKey: ['privacy-settings'],
        queryFn: async () => {
            const response = await api.get<GetPrivacySettingsResponse>('/privacy/settings')
            return response.data.settings as PrivacySettings
        },
    })
}

export default usePrivacySettings
