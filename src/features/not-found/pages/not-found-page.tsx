import { Link } from 'react-router-dom';

import { useLocalization } from '@/features/localization/localization-context';

export function NotFoundPage() {
  const { t } = useLocalization();

  return (
    <section className="panel empty-state">
      <p className="eyebrow">{t('notFound.eyebrow')}</p>
      <h1>{t('notFound.title')}</h1>
      <p>{t('notFound.description')}</p>
      <Link className="primary-button" to="/">
        {t('notFound.action')}
      </Link>
    </section>
  );
}
