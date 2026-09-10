export type BlockedUser = {
    id: number,
    createdAt: string,
    user: {
        id: number,
        username: string,
        name: string | null,
        avatarUrl: string | null,
    },
}
