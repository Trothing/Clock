export type ContactUser = {
    id: number,
    username: string,
    name: string | null,
    avatarUrl: string | null,
    avatarColor: string | null,
}

export type Contact = {
    id: number,
    alias: string | null,
    createdAt: string,
    user: ContactUser,
}
