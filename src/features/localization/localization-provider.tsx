import {
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import {
  LocalizationContext,
  type LocalizationContextValue,
} from '@/features/localization/localization-context';
import {
  loadPreferredLanguage,
  savePreferredLanguage,
} from '@/features/localization/language-preference';
import {
  translate,
  type AppLanguage,
} from '@/features/localization/translations';

interface LocalizationProviderProps {
  children: ReactNode;
  initialLanguage?: AppLanguage;
}

export function LocalizationProvider({
  children,
  initialLanguage,
}: LocalizationProviderProps) {
  const [language, setCurrentLanguage] = useState<AppLanguage>(() =>
    initialLanguage ?? loadPreferredLanguage(),
  );

  useEffect(() => {
    const previousLanguage = document.documentElement.lang;
    document.documentElement.lang = language;

    return () => {
      document.documentElement.lang = previousLanguage;
    };
  }, [language]);

  const setLanguage = (nextLanguage: AppLanguage) => {
    setCurrentLanguage(nextLanguage);
    savePreferredLanguage(nextLanguage);
  };

  const value: LocalizationContextValue = {
    language,
    setLanguage,
    t: (key, values) => translate(language, key, values),
  };

  return (
    <LocalizationContext.Provider value={value}>
      {children}
    </LocalizationContext.Provider>
  );
}
