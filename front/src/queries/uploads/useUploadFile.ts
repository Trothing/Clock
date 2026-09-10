import {useMutation} from "@tanstack/react-query";
import {api} from "../../config/axios.ts";

export type UploadedFile = {
    url: string
    mimeType: string
    size: number
}

function useUploadFile(kind: 'avatar' | 'attachment') {
    return useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData()
            formData.append('file', file)

            const response = await api.post<UploadedFile>(`/uploads/${kind}`, formData)
            return response.data
        },
    })
}

export default useUploadFile
