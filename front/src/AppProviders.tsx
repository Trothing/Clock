import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import SocketConnector from "./SocketConnector.tsx";
import {ConfirmDialogProvider} from "./providers/ConfirmDialogProvider.tsx";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
        },
    },
})

function AppProviders() {
    return (
        <QueryClientProvider client={queryClient}>
            <ConfirmDialogProvider>
                <SocketConnector />
            </ConfirmDialogProvider>
        </QueryClientProvider>
    );
}

export default AppProviders