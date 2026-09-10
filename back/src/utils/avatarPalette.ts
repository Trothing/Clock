export const AVATAR_PALETTE = ['#5E86AD', '#B06B62', '#6B9080', '#B08968', '#8B7FA8', '#B27F94', '#5FA0A3', '#A3A063'] as const

export function randomAvatarColor(): string {
    return AVATAR_PALETTE[Math.floor(Math.random() * AVATAR_PALETTE.length)]
}
