import {useEffect, useState} from "react";

function useDebouncedValue<T>(value: T, delayMs: number = 350): T {
    const [debounced, setDebounced] = useState(value)

    useEffect(() => {
        const timeoutId = setTimeout(() => setDebounced(value), delayMs)
        return () => clearTimeout(timeoutId)
    }, [value, delayMs])

    return debounced
}

export default useDebouncedValue
