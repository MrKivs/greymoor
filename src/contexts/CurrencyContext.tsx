import { createContext, useContext, useState, ReactNode } from "react";

type Currency = "KES" | "USD" | "EUR" | "GBP";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatPrice: (amountKES: number) => string;
  convertFromKES: (amountKES: number) => number;
}

const exchangeRates: Record<Currency, number> = {
  KES: 1,
  USD: 1 / 130,
  EUR: 1 / 140,
  GBP: 1 / 165,
};

const currencySymbols: Record<Currency, string> = {
  KES: "KES",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

const CurrencyContext = createContext<CurrencyContextType>({
  currency: "KES",
  setCurrency: () => {},
  formatPrice: (a) => `KES ${a.toLocaleString()}`,
  convertFromKES: (a) => a,
});

export const useCurrency = () => useContext(CurrencyContext);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrency] = useState<Currency>("KES");

  const convertFromKES = (amountKES: number): number => {
    return amountKES * exchangeRates[currency];
  };

  const formatPrice = (amountKES: number): string => {
    const converted = convertFromKES(amountKES);
    const symbol = currencySymbols[currency];
    if (currency === "KES") {
      return `${symbol} ${Math.round(converted).toLocaleString()}`;
    }
    return `${symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, convertFromKES }}>
      {children}
    </CurrencyContext.Provider>
  );
};
