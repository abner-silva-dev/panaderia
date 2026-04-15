import currency from "currency.js";

export function formatCurrency(value, options = {}) {
  return currency(value, options).format();
}

// export function getCurrencySymbol(curtentCurrency) {
//   return currencySymbolEnum[curtentCurrency || "MXN"]?.ascii || "$";
// }
