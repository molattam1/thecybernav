// /hooks/useCartCount.ts
import { useEffect, useState } from "react";

export function useCartCount() {
    const [count, setCount] = useState(0);
    useEffect(() => {
        let mounted = true;
        const fetchCount = async () => {
            const r = await fetch("/api/cart/count", { cache: "no-store" });
            if (!mounted) return;
            const j = await r.json();
            setCount(j.count ?? 0);
        };
        fetchCount();
        // Optional: re-poll occasionally or use SWR if you like.
        const id = setInterval(fetchCount, 20_000);
        return () => { mounted = false; clearInterval(id); };
    }, []);
    return count;
}
