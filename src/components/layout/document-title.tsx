import { useEffect } from 'react';
import { useMatches } from 'react-router-dom';

import { useLocalization } from '@/features/localization/localization-context';
import type { TranslationKey } from '@/features/localization/translations';

const applicationTitle = 'dev-ai-toolkit';

function getRouteTitleKey(handle: unknown) {
  if (!handle || typeof handle !== 'object') {
    return undefined;
  }

  const routeTitleKey = (handle as Record<string, unknown>).documentTitleKey;

  return typeof routeTitleKey === 'string'
    ? (routeTitleKey as TranslationKey)
    : undefined;
}

export function DocumentTitle() {
  const matches = useMatches();
  const { t } = useLocalization();
  const routeTitleKey = matches.reduce<TranslationKey | undefined>(
    (currentTitle, match) => getRouteTitleKey(match.handle) ?? currentTitle,
    undefined,
  );
  const routeTitle = routeTitleKey ? t(routeTitleKey) : undefined;

  useEffect(() => {
    const previousTitle = document.title;
    document.title = routeTitle
      ? `${routeTitle} | ${applicationTitle}`
      : applicationTitle;

    return () => {
      document.title = previousTitle;
    };
  }, [routeTitle]);

  return null;
}
