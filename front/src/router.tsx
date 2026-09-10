import {createBrowserRouter} from "react-router-dom";
import RegisterPage from "./pages/auth/register/registerPage.tsx";
import LoginPage from "./pages/auth/login/loginPage.tsx";
import LogoutPage from "./pages/auth/logout/logoutPage.tsx";
import NoChatSelected from "./pages/chats/noChatSelected.tsx";
import ChatPage from "./pages/chats/ChatPage/ChatPage.tsx";
import HomePage from "./pages/HomePage/homePage.tsx";
import RequireGuest from "./components/RequireGuest/RequireGuest.tsx";
import ErrorPage from "./pages/ErrorPage/ErrorPage.tsx";
import NotFoundPage from "./pages/NotFoundPage/NotFoundPage.tsx";

export const router = createBrowserRouter([
    {
        path: '/',
        element: <HomePage/>,
        errorElement: <ErrorPage/>,
        children: [
            {index: true, element: <NoChatSelected/>},
            {path: 'chats/:id', element: <ChatPage/>},
        ]
    },
    {
        path: '/register',
        element: <RequireGuest><RegisterPage/></RequireGuest>,
        errorElement: <ErrorPage/>,
    },
    {
        path: '/login',
        element: <RequireGuest><LoginPage/></RequireGuest>,
        errorElement: <ErrorPage/>,
    },
    {
        path: '/logout',
        element: <LogoutPage/>,
        errorElement: <ErrorPage/>,
    },
    {
        path: '*',
        element: <NotFoundPage/>,
    },
])
