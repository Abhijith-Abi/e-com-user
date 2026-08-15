export type Currency = "INR";

// Warehouse UUIDs from API
const WAREHOUSE_INDIA = "c96634bd-990a-4594-b1e9-13fcab053c2a"; // Indian Central Warehouse

// Country to warehouse mapping
export const countryToWarehouse: Record<string, string> = {
    INDIA: WAREHOUSE_INDIA,
    UAE: WAREHOUSE_INDIA,
    UK: WAREHOUSE_INDIA,
    USA: WAREHOUSE_INDIA,
    IN: WAREHOUSE_INDIA,
    AE: WAREHOUSE_INDIA,
    GB: WAREHOUSE_INDIA,
};

// Country to available currencies mapping
export const countryToCurrencies: Record<string, Currency[]> = {
    INDIA: ["INR"],
    UAE: ["INR"],
    UK: ["INR"],
    USA: ["INR"],
    IN: ["INR"],
    AE: ["INR"],
    GB: ["INR"],
};

// Warehouse mapping based on currency
export const currencyToWarehouse: Record<Currency, string> = {
    INR: WAREHOUSE_INDIA,
};

// Get available currencies for a warehouse
export const getWarehouseCurrencies = (warehouseId: string): Currency[] => {
    return ["INR"];
};

// Get warehouse ID from currency
export const getWarehouseFromCurrency = (currency: Currency): string => {
    return currencyToWarehouse[currency];
};

// Get warehouse ID from country code
export const getWarehouseFromCountry = (countryCode: string): string => {
    return countryToWarehouse[countryCode] || WAREHOUSE_INDIA;
};

export const currencySymbols: Record<Currency, string> = {
    INR: "₹",
};

export const exchangeRates: Record<Currency, number> = {
    INR: 1,
};

export const countryCurrencyMap: Record<string, Currency> = {
    INDIA: "INR",
    UK: "INR",
    USA: "INR",
    UAE: "INR",
    IN: "INR",
    GB: "INR",
    US: "INR",
    CA: "INR",
    AU: "INR",
    SG: "INR",
};

const MANUAL_KEY = "hov_manual_currency";
const AUTO_KEY = "hov_auto_currency";

const isValid = (v: string | null): v is Currency =>
    v === "INR";

export const getManualCurrency = (): Currency | null => {
    try {
        const v = localStorage.getItem(MANUAL_KEY);
        return isValid(v) ? v : null;
    } catch {
        return null;
    }
};

export const setManualCurrency = (c: Currency): void => {
    try {
        localStorage.setItem(MANUAL_KEY, c);
    } catch {}
};

export const getAutoCurrency = (): Currency | null => {
    try {
        const v = localStorage.getItem(AUTO_KEY);
        return isValid(v) ? v : null;
    } catch {
        return null;
    }
};

export const setAutoCurrency = (c: Currency): void => {
    try {
        localStorage.setItem(AUTO_KEY, c);
    } catch {}
};

/** Priority: manual pick → auto-detected → default */
export const getInitialCurrency = (): Currency =>
    getManualCurrency() ?? getAutoCurrency() ?? "INR";
