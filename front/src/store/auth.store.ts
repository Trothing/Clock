import {create} from "zustand";
import {devtools} from "zustand/middleware";
import type {User} from "../types/user.type.ts";

type AuthState = {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;

    login: (user: User, accessToken: string) => void;
    logout: () => void;
    setUser: (user: User) => void;
    renewAccessToken: (token: string) => void;
}


export const useAuthStore = create<AuthState>()(
    devtools(
        (set) => ({
            user: null,
            isAuthenticated: false,
            accessToken: null,

            renewAccessToken: (token) =>
                set({accessToken: token}),

            login: (user, accessToken) =>
                set({
                    user,
                    accessToken,
                    isAuthenticated: true,
                }),

            logout: () =>
                set({
                    user: null,
                    accessToken: null,
                    isAuthenticated: false,
                }),

            setUser: (user) => set({user}),
        }),
        {name: "AuthStore"}
    )
);
