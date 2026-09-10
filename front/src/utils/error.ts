import axios from 'axios'

export function getErrorMessage(err: unknown, fallback: string): string {
    if (axios.isAxiosError(err)) {
        const data = err.response?.data as { message?: string } | undefined
        return data?.message ?? err.message
    }
    if (err instanceof Error) {
        return err.message
    }
    return fallback
}
