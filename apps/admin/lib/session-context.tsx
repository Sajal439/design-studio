"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";

type SessionUser = {
    id: string;
    name: string;
    email: string | null;
    role: string;
    isActive: boolean;
} | null;

type SessionContextValue = {
    user: SessionUser;
    isLoading: boolean;
    refresh: () => void;
};

const SessionContext = createContext<SessionContextValue>({
    user: null,
    isLoading: true,
    refresh: () => { },
});

export function SessionProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<SessionUser>(null);
    const [isLoading, setIsLoading] = useState(true);

    async function fetchSession() {
        try {
            const res = await fetch("/api/auth/me", { cache: "no-store" });
            if (res.ok) {
                const data = await res.json() as { user: SessionUser };
                setUser(data.user);
            } else {
                setUser(null);
            }
        } catch {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchSession();
    }, []);

    return (
        <SessionContext.Provider value={{ user, isLoading, refresh: fetchSession }}>
            {children}
        </SessionContext.Provider>
    );
}

export function useSession() {
    return useContext(SessionContext);
}