import { useState } from 'react';

import { useLocalization } from '@/features/localization/localization-context';
import { ApiBuilderForm } from '@/features/api-builder/components/api-builder-form';
import { ApiBuilderPreview } from '@/features/api-builder/components/api-builder-preview';
import {
  apiBuilderSampleState,
  type ApiBuilderState,
} from '@/features/api-builder/lib/api-builder-utils';

const emptyApiBuilderState: ApiBuilderState = {
  method: 'GET',
  url: '',
  queryParams: [],
  headers: [],
  body: '',
};

export function ApiBuilderPage() {
  const { t } = useLocalization();
  const [state, setState] = useState<ApiBuilderState>(apiBuilderSampleState);

  return (
    <section className="api-builder-layout">
      <div className="playground-hero panel">
        <p className="eyebrow">{t('api.hero.eyebrow')}</p>
        <h1>{t('api.hero.title')}</h1>
        <p className="panel__summary">{t('api.hero.summary')}</p>
      </div>

      <div className="api-grid">
        <ApiBuilderForm
          state={state}
          onStateChange={setState}
          onLoadSample={() => setState(apiBuilderSampleState)}
          onReset={() => setState(emptyApiBuilderState)}
        />
        <ApiBuilderPreview state={state} />
      </div>
    </section>
  );
}
