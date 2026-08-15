import { useEffect } from "react";
import { useSettingsStoreBase } from "@/store/useSettingsStore";

/**
 * Simplified hook to ensure currency is always INR.
 */
export function useGeoCurrency() {
    const setCurrency = useSettingsStoreBase((s) => s.setCurrencyAuto);

    useEffect(() => {
        setCurrency("INR");
    }, [setCurrency]);
}
