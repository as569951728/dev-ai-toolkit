import { useState } from 'react';

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
  const [state, setState] = useState<ApiBuilderState>(apiBuilderSampleState);

  return (
    <section className="api-builder-layout">
      <div className="playground-hero panel">
        <p className="eyebrow">API Builder</p>
        <h1>Shape API requests before you wire them into code.</h1>
        <p className="panel__summary">
          Build URLs, query params, headers, and request payloads in one place,
          then copy the generated fetch snippet into your app or debugging flow.
        </p>
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
