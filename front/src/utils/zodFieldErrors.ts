import type {ZodError} from "zod";

export function getFieldErrors(error: ZodError): Record<string, string> {
    const fieldErrors: Record<string, string> = {}
    for (const issue of error.issues) {
        const field = String(issue.path[0] ?? '')
        if (field && !fieldErrors[field]) fieldErrors[field] = issue.message
    }
    return fieldErrors
}
