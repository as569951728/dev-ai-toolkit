import { useLocalization } from '@/features/localization/localization-context';

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLocalization();

  return (
    <div className="language-switcher" role="group" aria-label={t('language.label')}>
      <button
        aria-pressed={language === 'zh-CN'}
        className="language-switcher__option"
        type="button"
        onClick={() => setLanguage('zh-CN')}
      >
        {t('language.chinese')}
      </button>
      <button
        aria-pressed={language === 'en'}
        className="language-switcher__option"
        type="button"
        onClick={() => setLanguage('en')}
      >
        {t('language.english')}
      </button>
    </div>
  );
}
