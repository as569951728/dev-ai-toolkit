import { ApiBuilderPairsEditor } from '@/features/api-builder/components/api-builder-pairs-editor';
import type {
  ApiBuilderState,
  ApiFieldPair,
} from '@/features/api-builder/lib/api-builder-utils';

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
  return (
    <section className="panel api-panel">
      <div className="api-panel__header">
        <div>
          <p className="eyebrow">Request Builder</p>
          <h2>Compose an API request</h2>
          <p className="panel__summary">
            Build the request shape locally first, then copy the generated
            snippet into your app, docs, or debugging workflow.
          </p>
        </div>

        <div className="panel__actions">
          <button className="ghost-button" type="button" onClick={onLoadSample}>
            Load sample
          </button>
          <button className="ghost-button" type="button" onClick={onReset}>
            Reset
          </button>
        </div>
      </div>

      <div className="api-form">
        <label className="field">
          <span>HTTP method</span>
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
          <span>Base URL</span>
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
            title="Query params"
            description="Optional query string parameters that will be appended to the URL."
            pairs={state.queryParams}
            keyPlaceholder="param"
            valuePlaceholder="value"
            onChange={(pairs) =>
              onStateChange(updatePairs(state, 'queryParams', pairs))
            }
          />
        </div>

        <div className="field field--full">
          <ApiBuilderPairsEditor
            title="Headers"
            description="Headers are represented as simple key-value pairs for now."
            pairs={state.headers}
            keyPlaceholder="Header-Name"
            valuePlaceholder="Header value"
            onChange={(pairs) =>
              onStateChange(updatePairs(state, 'headers', pairs))
            }
          />
        </div>

        <label className="field field--full">
          <span>JSON body</span>
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
