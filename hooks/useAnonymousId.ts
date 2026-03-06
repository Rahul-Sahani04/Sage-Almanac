import { useState, useEffect } from "react";

export function useAnonymousId() {
    const [anonymousId, setAnonymousId] = useState<string | undefined>(undefined);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        try {
            let storedId = localStorage.getItem("cAleena_anonId");
            if (!storedId) {
                storedId = `anon_${window.crypto.randomUUID()}`;
                localStorage.setItem("cAleena_anonId", storedId);
            }
            setAnonymousId(storedId);
        } catch (error) {
            console.error("Failed to generate or access anonymous ID from localStorage", error);
            // Fallback for strict privacy modes
            setAnonymousId(`anon_${Date.now()}_${Math.random()}`);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    return { anonymousId, isLoaded };
}
