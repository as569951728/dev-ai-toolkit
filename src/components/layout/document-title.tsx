import { useEffect } from 'react';
import { useMatches } from 'react-router-dom';

const applicationTitle = 'dev-ai-toolkit';

function getRouteTitle(handle: unknown) {
  if (!handle || typeof handle !== 'object') {
    return undefined;
  }

  const routeTitle = (handle as Record<string, unknown>).documentTitle;

  return typeof routeTitle === 'string' ? routeTitle : undefined;
}

export function DocumentTitle() {
  const matches = useMatches();
  const routeTitle = matches.reduce<string | undefined>(
    (currentTitle, match) => getRouteTitle(match.handle) ?? currentTitle,
    undefined,
  );

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
