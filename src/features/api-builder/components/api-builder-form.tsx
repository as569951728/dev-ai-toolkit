import { ApiBuilderPairsEditor } from '@/features/api-builder/components/api-builder-pairs-editor';
import type {
  ApiBuilderState,
  ApiFieldPair,
} from '@/features/api-builder/lib/api-builder-utils';
import { useLocalization } from '@/features/localization/localization-context';

interface ApiBuilderFormProps {
  state: ApiBuilderState;
  onStateChange: (state: ApiBuilderState) => void;
  onLoadSample: () => void;
  onReset: () => void;
}

const methodOptions = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

function updatePairs(
  state: ApiBuilderState,
  field: 'headers' | 'queryParams',
  value: ApiFieldPair[],
) {
  return {
    ...state,
    [field]: value,
  };
}

export function ApiBuilderForm({
  state,
  onStateChange,
  onLoadSample,
  onReset,
}: ApiBuilderFormProps) {
  const { t } = useLocalization();
  return (
    <section className="panel api-panel">
      <div className="api-panel__header">
        <div>
          <p className="eyebrow">{t('api.form.eyebrow')}</p>
          <h2>{t('api.form.title')}</h2>
          <p className="panel__summary">{t('api.form.summary')}</p>
        </div>

        <div className="panel__actions">
          <button className="ghost-button" type="button" onClick={onLoadSample}>
            {t('api.form.sample')}
          </button>
          <button className="ghost-button" type="button" onClick={onReset}>
            {t('api.form.reset')}
          </button>
        </div>
      </div>

      <div className="api-form">
        <label className="field">
          <span>{t('api.form.method')}</span>
          <select
            value={state.method}
            onChange={(event) =>
              onStateChange({
                ...state,
                method: event.target.value,
              })
            }
          >
            {methodOptions.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
        </label>

        <label className="field field--full">
          <span>{t('api.form.baseUrl')}</span>
          <input
            value={state.url}
            onChange={(event) =>
              onStateChange({
                ...state,
                url: event.target.value,
              })
            }
            placeholder="https://api.example.com/v1/resource"
          />
        </label>

        <div className="field field--full">
          <ApiBuilderPairsEditor
            title={t('api.form.queryTitle')}
            description={t('api.form.queryDescription')}
            pairs={state.queryParams}
            keyPlaceholder={t('api.form.queryKey')}
            valuePlaceholder={t('api.form.queryValue')}
            onChange={(pairs) =>
              onStateChange(updatePairs(state, 'queryParams', pairs))
            }
          />
        </div>

        <div className="field field--full">
          <ApiBuilderPairsEditor
            title={t('api.form.headersTitle')}
            description={t('api.form.headersDescription')}
            pairs={state.headers}
            keyPlaceholder={t('api.form.headerKey')}
            valuePlaceholder={t('api.form.headerValue')}
            onChange={(pairs) =>
              onStateChange(updatePairs(state, 'headers', pairs))
            }
          />
        </div>

        <label className="field field--full">
          <span>{t('api.form.body')}</span>
          <textarea
            className="api-textarea"
            rows={14}
            value={state.body}
            onChange={(event) =>
              onStateChange({
                ...state,
                body: event.target.value,
              })
            }
            placeholder='{\n  "key": "value"\n}'
            spellCheck={false}
          />
        </label>
      </div>
    </section>
  );
}
