import {useEffect, useRef, useState, type KeyboardEvent} from "react";
import {File as FileIcon, Loader2, Mic, Paperclip, Pencil, Reply, Send, Smile, Trash2, X} from "lucide-react";
import type {AttachmentInput, Message} from "../../types/messages.type.ts";
import useUploadFile from "../../queries/uploads/useUploadFile.ts";
import {getErrorMessage} from "../../utils/error.ts";
import useEscapeKey from "../../hooks/useEscapeKey.ts";
import Emoji from "../Emoji/Emoji.tsx";
import styles from './MessageInput.module.scss'

const EMOJI_LIST = [
    '😀', '😁', '😂', '🤣', '😊', '😍', '😘', '😜', '🤔', '🙄',
    '😴', '😭', '😢', '😡', '😱', '😎', '🥳', '🤗', '🤫', '🤝',
    '👍', '👎', '👌', '🙏', '👏', '💪', '🤙', '✌️', '🤞', '👋',
    '❤️', '🔥', '✨', '🎉', '💯', '⭐', '☕', '🍕', '🎮', '⚽',
    '😅', '😇', '🥰', '😏', '😬', '🤯', '🤡', '💀',
] as const

type MessageInputProps = {
    onSend: (content: string, replyToMessageId?: number, attachment?: AttachmentInput) => void
    onEditSubmit: (messageId: number, content: string) => void
    onTyping?: () => void
    onStoppedTyping?: () => void
    replyingTo?: Message | null
    onCancelReply?: () => void
    editingMessage?: Message | null
    onCancelEdit?: () => void
    disabled?: boolean
    disabledMessage?: string
}

const previewLabel = (message: Message) => message.sender?.name || message.sender?.username || 'Someone'

function formatRecordingTime(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${String(secs).padStart(2, '0')}`
}

const MessageInput = ({onSend, onEditSubmit, onTyping, onStoppedTyping, replyingTo, onCancelReply, editingMessage, onCancelEdit, disabled, disabledMessage}: MessageInputProps) => {
    const [value, setValue] = useState('')
    const [emojiPickerOpen, setEmojiPickerOpen] = useState(false)
    const [attachment, setAttachment] = useState<AttachmentInput | null>(null)
    const [attachmentName, setAttachmentName] = useState('')
    const [attachmentError, setAttachmentError] = useState<string | null>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const {mutate: uploadAttachment, isPending: isUploadingAttachment} = useUploadFile('attachment')

    useEscapeKey(() => setEmojiPickerOpen(false), emojiPickerOpen)

    const [isRecording, setIsRecording] = useState(false)
    const [recordingSeconds, setRecordingSeconds] = useState(0)
    const [recordingError, setRecordingError] = useState<string | null>(null)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const mediaStreamRef = useRef<MediaStream | null>(null)
    const audioChunksRef = useRef<Blob[]>([])
    const recordingTimerRef = useRef<number | null>(null)

    useEffect(() => {
        if (editingMessage) {
            setValue(editingMessage.content ?? '')
        }
    }, [editingMessage])

    useEffect(() => {
        return () => {
            mediaStreamRef.current?.getTracks().forEach((track) => track.stop())
            if (recordingTimerRef.current) window.clearInterval(recordingTimerRef.current)
        }
    }, [])

    const startRecording = async () => {
        setRecordingError(null)
        try {
            const stream = await navigator.mediaDevices.getUserMedia({audio: true})
            mediaStreamRef.current = stream
            audioChunksRef.current = []

            const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : ''
            const recorder = mimeType ? new MediaRecorder(stream, {mimeType}) : new MediaRecorder(stream)
            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data)
            }
            recorder.start()
            mediaRecorderRef.current = recorder

            setIsRecording(true)
            setRecordingSeconds(0)
            recordingTimerRef.current = window.setInterval(() => setRecordingSeconds((s) => s + 1), 1000)
        } catch {
            setRecordingError('No access to microphone')
        }
    }

    const stopRecording = (send: boolean) => {
        const recorder = mediaRecorderRef.current
        if (!recorder) return

        recorder.onstop = () => {
            mediaStreamRef.current?.getTracks().forEach((track) => track.stop())
            mediaStreamRef.current = null
            mediaRecorderRef.current = null
            if (recordingTimerRef.current) window.clearInterval(recordingTimerRef.current)
            setIsRecording(false)

            if (!send || audioChunksRef.current.length === 0) return

            const blob = new Blob(audioChunksRef.current, {type: 'audio/webm'})
            const file = new File([blob], `voice-${Date.now()}.webm`, {type: 'audio/webm'})

            uploadAttachment(file, {
                onSuccess: ({url, mimeType, size}) => onSend('', replyingTo?.id, {url, mimeType, size}),
                onError: (err) => setRecordingError(getErrorMessage(err, 'Failed to send voice message')),
            })
        }
        recorder.stop()
    }

    const clearAttachment = () => {
        setAttachment(null)
        setAttachmentName('')
        setAttachmentError(null)
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        e.target.value = ''
        if (!file) return

        setAttachmentError(null)
        setAttachmentName(file.name)
        setAttachment(null)

        uploadAttachment(file, {
            onSuccess: ({url, mimeType, size}) => setAttachment({url, mimeType, size}),
            onError: (err) => {
                setAttachmentError(getErrorMessage(err, 'Failed to upload file'))
                setAttachmentName('')
            },
        })
    }

    const insertEmoji = (emoji: string) => {
        const textarea = textareaRef.current
        const start = textarea?.selectionStart ?? value.length
        const end = textarea?.selectionEnd ?? value.length
        const nextValue = value.slice(0, start) + emoji + value.slice(end)

        setValue(nextValue)
        setEmojiPickerOpen(false)

        requestAnimationFrame(() => {
            const cursor = start + emoji.length
            textarea?.focus()
            textarea?.setSelectionRange(cursor, cursor)
        })
    }

    const submit = () => {
        const content = value.trim()

        if (editingMessage) {
            if (!content) return
            onEditSubmit(editingMessage.id, content)
        } else {
            if (!content && !attachment) return
            if (isUploadingAttachment) return
            onSend(content, replyingTo?.id, attachment ?? undefined)
            clearAttachment()
        }
        setValue('')
        onStoppedTyping?.()
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            submit()
        }
        if (e.key === 'Escape') {
            if (editingMessage) onCancelEdit?.()
            else if (replyingTo) onCancelReply?.()
        }
    }

    return (
        <div className={styles.wrapper}>
            {editingMessage && (
                <div className={styles.contextBar}>
                    <Pencil size={13} className={styles.contextIcon}/>
                    <div className={styles.contextText}>
                        <span className={styles.contextTitle}>Editing message</span>
                    </div>
                    <button type="button" className={styles.contextCancel} onClick={onCancelEdit} title="Cancel">
                        <X size={14}/>
                    </button>
                </div>
            )}

            {!editingMessage && replyingTo && (
                <div className={styles.contextBar}>
                    <Reply size={13} className={styles.contextIcon}/>
                    <div className={styles.contextText}>
                        <span className={styles.contextTitle}>Reply to {previewLabel(replyingTo)}</span>
                        <span className={styles.contextPreview}>{replyingTo.content}</span>
                    </div>
                    <button type="button" className={styles.contextCancel} onClick={onCancelReply} title="Cancel">
                        <X size={14}/>
                    </button>
                </div>
            )}

            {!editingMessage && (attachmentName || attachmentError) && (
                <div className={styles.contextBar}>
                    {isUploadingAttachment
                        ? <Loader2 size={13} className={`${styles.contextIcon} ${styles.spinning}`}/>
                        : <FileIcon size={13} className={styles.contextIcon}/>}
                    <div className={styles.contextText}>
                        <span className={styles.contextTitle}>
                            {attachmentError ? 'Upload error' : isUploadingAttachment ? 'Uploading...' : 'File ready'}
                        </span>
                        <span className={styles.contextPreview}>{attachmentError || attachmentName}</span>
                    </div>
                    <button type="button" className={styles.contextCancel} onClick={clearAttachment} title="Remove">
                        <X size={14}/>
                    </button>
                </div>
            )}

            {recordingError && (
                <div className={styles.contextBar}>
                    <Mic size={13} className={styles.contextIcon}/>
                    <div className={styles.contextText}>
                        <span className={styles.contextTitle}>Error</span>
                        <span className={styles.contextPreview}>{recordingError}</span>
                    </div>
                    <button type="button" className={styles.contextCancel} onClick={() => setRecordingError(null)} title="Remove">
                        <X size={14}/>
                    </button>
                </div>
            )}

            {isRecording ? (
                <div className={styles.inputRow}>
                    <button type="button" className={styles.toolButton} onClick={() => stopRecording(false)} title="Cancel">
                        <Trash2 size={19}/>
                    </button>
                    <div className={styles.recordingIndicator}>
                        <span className={styles.recordingDot}/>
                        <span className={styles.recordingTime}>{formatRecordingTime(recordingSeconds)}</span>
                    </div>
                    <button
                        type="button"
                        className={styles.sendButton}
                        onClick={() => stopRecording(true)}
                        disabled={isUploadingAttachment}
                        title="Send voice message"
                    >
                        <Send size={17} strokeWidth={2.2}/>
                    </button>
                </div>
            ) : (
            <div className={styles.inputRow}>
                <button
                    type="button"
                    className={styles.toolButton}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={!!editingMessage || disabled}
                    title="Attach file"
                >
                    <Paperclip size={19}/>
                </button>
                <input ref={fileInputRef} type="file" className={styles.hiddenFileInput} onChange={handleFileChange}/>

                <textarea
                    ref={textareaRef}
                    className={`${styles.textarea} ${disabled && disabledMessage ? styles.textareaDisabledMessage : ''}`}
                    placeholder={disabled && disabledMessage ? disabledMessage : "Write a message..."}
                    rows={1}
                    value={value}
                    disabled={disabled}
                    onChange={(e) => {
                        setValue(e.target.value)
                        if (!editingMessage) onTyping?.()
                    }}
                    onKeyDown={handleKeyDown}
                />

                <div className={styles.emojiPickerWrapper}>
                    <button
                        type="button"
                        className={styles.toolButton}
                        onClick={() => setEmojiPickerOpen((prev) => !prev)}
                        disabled={disabled}
                        title="Emoji"
                    >
                        <Smile size={19}/>
                    </button>
                    {emojiPickerOpen && (
                        <>
                            <div className={styles.pickerBackdrop} onClick={() => setEmojiPickerOpen(false)}/>
                            <div className={styles.emojiPicker}>
                                {EMOJI_LIST.map((emoji) => (
                                    <button
                                        key={emoji}
                                        type="button"
                                        className={styles.emojiPickerItem}
                                        onClick={() => insertEmoji(emoji)}
                                    >
                                        <Emoji emoji={emoji} size={26}/>
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {value.trim() || attachment ? (
                    <button
                        type="button"
                        className={styles.sendButton}
                        disabled={disabled || isUploadingAttachment}
                        onClick={submit}
                        title={editingMessage ? 'Save' : 'Send'}
                    >
                        <Send size={17} strokeWidth={2.2}/>
                    </button>
                ) : (
                    <button type="button" className={styles.sendButton} onClick={startRecording} disabled={disabled} title="Voice message">
                        <Mic size={17} strokeWidth={2.2}/>
                    </button>
                )}
            </div>
            )}
        </div>
    )
}

export default MessageInput
