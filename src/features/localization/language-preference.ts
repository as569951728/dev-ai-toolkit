import type { AppLanguage } from '@/features/localization/translations';

export const languageStorageKey = 'dev-ai-toolkit.language';

export function detectPreferredLanguage(
  languages: readonly string[],
): AppLanguage {
  return languages.some((language) => language.toLowerCase().startsWith('zh'))
    ? 'zh-CN'
    : 'en';
}

export function loadPreferredLanguage(): AppLanguage {
  try {
    const storedLanguage = window.localStorage.getItem(languageStorageKey);

    if (storedLanguage === 'en' || storedLanguage === 'zh-CN') {
      return storedLanguage;
    }
  } catch {
    // Language selection can still work for the current session without storage.
  }

  return detectPreferredLanguage(navigator.languages ?? [navigator.language]);
}

export function savePreferredLanguage(language: AppLanguage) {
  try {
    window.localStorage.setItem(languageStorageKey, language);
  } catch {
    // Keep the in-memory selection when browser storage is unavailable.
  }
}
