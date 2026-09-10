import type {ReactNode} from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {X} from "lucide-react";
import styles from './Modal.module.scss'

type ModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    children: ReactNode
}

const Modal = ({open, onOpenChange, title, children}: ModalProps) => {
    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className={styles.overlay}/>
                <Dialog.Content className={styles.content}>
                    <div className={styles.header}>
                        <Dialog.Title className={styles.title}>{title}</Dialog.Title>
                        <Dialog.Close asChild>
                            <button type="button" className={styles.closeButton} title="Close">
                                <X size={18}/>
                            </button>
                        </Dialog.Close>
                    </div>
                    {children}
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}

export default Modal
