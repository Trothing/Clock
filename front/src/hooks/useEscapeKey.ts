import {useEffect} from "react";

function useEscapeKey(onEscape: () => void, enabled: boolean) {
    useEffect(() => {
        if (!enabled) return

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onEscape()
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [enabled, onEscape])
}

export default useEscapeKey
