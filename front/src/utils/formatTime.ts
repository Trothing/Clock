export function formatTime(iso: string) {
    const date = new Date(iso)
    const isToday = date.toDateString() === new Date().toDateString()
    if (isToday) {
        return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
    }
    return date.toLocaleDateString([], {day: '2-digit', month: '2-digit'})
}

export function formatMessageTime(iso: string) {
    return new Date(iso).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
}

export function formatDateLabel(iso: string) {
    const date = new Date(iso)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    if (isToday) return 'Today'

    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'

    const isSameYear = date.getFullYear() === now.getFullYear()
    return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: isSameYear ? undefined : 'numeric',
    })
}
