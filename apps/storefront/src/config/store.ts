import storeConfig from '../../config/store.config.json';

export type StoreConfig = typeof storeConfig;

export const storeSettings: StoreConfig = storeConfig;

export const vatRateDecimal = storeSettings.tax.ivaPercent / 100;

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat(storeSettings.currency.locale, {
    style: 'currency',
    currency: storeSettings.currency.code,
    currencyDisplay: 'symbol',
    minimumFractionDigits: 2
  }).format(amount);
}
