import {create} from "zustand";

type SocketStatusState = {
    isConnected: boolean;
    setConnected: (isConnected: boolean) => void;
}

export const useSocketStatusStore = create<SocketStatusState>()((set) => ({
    isConnected: false,
    setConnected: (isConnected) => set({isConnected}),
}));
