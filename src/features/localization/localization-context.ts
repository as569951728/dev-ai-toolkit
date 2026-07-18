import { createContext, useContext } from 'react';

import {
  translate,
  type AppLanguage,
  type TranslationKey,
  type TranslationValues,
} from '@/features/localization/translations';

export interface LocalizationContextValue {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  t: (key: TranslationKey, values?: TranslationValues) => string;
}

const defaultLocalizationContext: LocalizationContextValue = {
  language: 'en',
  setLanguage: () => undefined,
  t: (key, values) => translate('en', key, values),
};

export const LocalizationContext = createContext<LocalizationContextValue>(
  defaultLocalizationContext,
);

export function useLocalization() {
  return useContext(LocalizationContext);
}
