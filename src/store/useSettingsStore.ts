import { useMemo } from "react";
import { create } from "zustand";
import {
    type Currency,
    currencySymbols,
    exchangeRates,
    getInitialCurrency,
    setManualCurrency,
    getWarehouseFromCurrency,
    getWarehouseCurrencies,
} from "@/lib/currency";

export type { Currency };

interface SettingsStoreState {
    currency: Currency;
    currencySymbol: string;
    warehouseId: string;
    availableCurrencies: Currency[];
    /** Called by user interaction — persists as manual pick */
    setCurrency: (currency: Currency) => void;
    /** Called by useGeoCurrency hook — does NOT persist as manual */
    setCurrencyAuto: (currency: Currency) => void;
    formatPrice: (priceINR: number) => string;
    formatPriceRaw: (price: number) => string;
    formatPriceExact: (price: number) => string;
}

const initialCurrency = getInitialCurrency();
const initialWarehouseId = getWarehouseFromCurrency(initialCurrency);
const initialAvailableCurrencies = getWarehouseCurrencies(initialWarehouseId);

export const useSettingsStoreBase = create<SettingsStoreState>((set, get) => ({
    currency: initialCurrency,
    currencySymbol: currencySymbols[initialCurrency],
    warehouseId: initialWarehouseId,
    availableCurrencies: initialAvailableCurrencies,

    setCurrency: (currency) => {
        setManualCurrency(currency);
        const warehouseId = getWarehouseFromCurrency(currency);
        const availableCurrencies = getWarehouseCurrencies(warehouseId);
        set({ 
            currency, 
            currencySymbol: currencySymbols[currency],
            warehouseId,
            availableCurrencies,
        });
    },

    setCurrencyAuto: (currency) => {
        if (get().currency !== currency) {
            const warehouseId = getWarehouseFromCurrency(currency);
            const availableCurrencies = getWarehouseCurrencies(warehouseId);
            set({ 
                currency, 
                currencySymbol: currencySymbols[currency],
                warehouseId,
                availableCurrencies,
            });
        }
    },

    formatPrice: (priceINR) => {
        const { currency } = get();
        const converted = Math.round(priceINR * exchangeRates[currency]);
        return `${currencySymbols[currency]}${converted.toLocaleString()}`;
    },

    formatPriceRaw: (price: number) => {
        const { currency } = get();
        return `${currencySymbols[currency]}${Math.round(price).toLocaleString()}`;
    },

    formatPriceExact: (price: number) => {
        const { currency } = get();
        const rounded = Math.round(price * 100) / 100;
        return `${currencySymbols[currency]}${rounded.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    },
}));

/**
 * Main settings hook — provides currency and formatting logic.
 */
export const useSettingsStore = () => {
    const store = useSettingsStoreBase();

    return useMemo(
        () => ({
            ...store,
        }),
        [store],
    );
};
