import * as Dialog from "@radix-ui/react-dialog";
import styles from './ConfirmDialog.module.scss'

type ConfirmDialogProps = {
    title: string
    message: string
    confirmLabel: string
    cancelLabel: string | null
    danger: boolean
    onConfirm: () => void
    onCancel: () => void
}

const ConfirmDialog = ({title, message, confirmLabel, cancelLabel, danger, onConfirm, onCancel}: ConfirmDialogProps) => {
    return (
        <Dialog.Root open onOpenChange={(open) => { if (!open) onCancel() }}>
            <Dialog.Portal>
                <Dialog.Overlay className={styles.overlay}/>
                <Dialog.Content className={styles.content}>
                    <Dialog.Title className={styles.title}>{title}</Dialog.Title>
                    <Dialog.Description className={styles.message}>{message}</Dialog.Description>
                    <div className={styles.actions}>
                        {cancelLabel !== null && (
                            <button type="button" className={styles.cancelButton} onClick={onCancel}>
                                {cancelLabel}
                            </button>
                        )}
                        <button
                            type="button"
                            className={`${styles.confirmButton} ${danger ? styles.confirmButtonDanger : ''}`}
                            onClick={onConfirm}
                            autoFocus
                        >
                            {confirmLabel}
                        </button>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}

export default ConfirmDialog
