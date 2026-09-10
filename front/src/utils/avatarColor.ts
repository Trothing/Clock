export const PALETTE = ['#5E86AD', '#B06B62', '#6B9080', '#B08968', '#8B7FA8', '#B27F94', '#5FA0A3', '#A3A063'] as const

export function getAvatarColor(seed: string): string {
    let hash = 0
    for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash)
    }
    return PALETTE[Math.abs(hash) % PALETTE.length]
}

export function getInitials(name: string): string {
    const words = name.trim().split(/\s+/).filter(Boolean)
    if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase()
    }
    return (words[0] ?? '').slice(0, 2).toUpperCase()
}
