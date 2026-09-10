import {createContext, useCallback, useContext, useState, type ReactNode} from "react";
import ConfirmDialog from "../components/ConfirmDialog/ConfirmDialog.tsx";

type ConfirmOptions = {
    title?: string
    message: string
    confirmLabel?: string
    cancelLabel?: string | null
    danger?: boolean
}

type ResolvedOptions = {
    title: string
    message: string
    confirmLabel: string
    cancelLabel: string | null
    danger: boolean
}

type PendingRequest = {
    options: ResolvedOptions
    resolve: (value: boolean) => void
}

type ConfirmDialogContextValue = {
    confirm: (options: ConfirmOptions) => Promise<boolean>
}

const ConfirmDialogContext = createContext<ConfirmDialogContextValue | null>(null)

export function ConfirmDialogProvider({children}: {children: ReactNode}) {
    const [pending, setPending] = useState<PendingRequest | null>(null)

    const confirm = useCallback((options: ConfirmOptions) => {
        return new Promise<boolean>((resolve) => {
            const cancelLabel = options.cancelLabel === null ? null : (options.cancelLabel ?? 'Cancel')
            setPending({
                options: {
                    title: options.title ?? (cancelLabel === null ? 'Notice' : 'Confirmation'),
                    message: options.message,
                    confirmLabel: options.confirmLabel ?? 'OK',
                    cancelLabel,
                    danger: options.danger ?? false,
                },
                resolve,
            })
        })
    }, [])

    const handleResult = (result: boolean) => {
        pending?.resolve(result)
        setPending(null)
    }

    return (
        <ConfirmDialogContext.Provider value={{confirm}}>
            {children}
            {pending && (
                <ConfirmDialog
                    {...pending.options}
                    onConfirm={() => handleResult(true)}
                    onCancel={() => handleResult(false)}
                />
            )}
        </ConfirmDialogContext.Provider>
    )
}

export function useConfirmDialog() {
    const ctx = useContext(ConfirmDialogContext)
    if (!ctx) throw new Error('useConfirmDialog must be used within ConfirmDialogProvider')
    return ctx
}
