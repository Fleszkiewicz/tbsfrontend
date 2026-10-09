import { useEffect, useState } from "react";

// Devuelve el valor recién después de que dejó de cambiar `delay` ms.
export function useDebounce<T>(value: T, delay = 300): T {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const id = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(id); // si el valor cambia antes, se cancela
    }, [value, delay]);

    return debounced;
}