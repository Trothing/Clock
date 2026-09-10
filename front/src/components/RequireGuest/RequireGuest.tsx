import type {ReactNode} from "react";
import {Navigate} from "react-router-dom";
import {useAuthStore} from "../../store/auth.store.ts";

type RequireGuestProps = {
    children: ReactNode
}

const RequireGuest = ({children}: RequireGuestProps) => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

    if (isAuthenticated) {
        return <Navigate to="/" replace/>
    }

    return children
}

export default RequireGuest
