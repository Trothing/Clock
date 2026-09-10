import {useMutation, useQueryClient} from "@tanstack/react-query";
import {api} from "../../config/axios.ts";
import type {
    PrivacySettings,
    UpdatePrivacySettingsFormData,
    UpdatePrivacySettingsResponse,
} from "../../types/privacySettings.type.ts";

function useUpdatePrivacySettings() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: UpdatePrivacySettingsFormData) => {
            const response = await api.patch<UpdatePrivacySettingsResponse>('/privacy/settings', data)
            return response.data.settings as PrivacySettings
        },
        onSuccess: (settings) => {
            queryClient.setQueryData(['privacy-settings'], settings)
        }
    })
}

export default useUpdatePrivacySettings
