import type { ApiFieldPair } from '@/features/api-builder/lib/api-builder-utils';

interface ApiBuilderPairsEditorProps {
  title: string;
  description: string;
  pairs: ApiFieldPair[];
  keyPlaceholder: string;
  valuePlaceholder: string;
  onChange: (pairs: ApiFieldPair[]) => void;
}

function createEmptyPair(): ApiFieldPair {
  return {
    id: crypto.randomUUID(),
    key: '',
    value: '',
  };
}

export function ApiBuilderPairsEditor({
  title,
  description,
  pairs,
  keyPlaceholder,
  valuePlaceholder,
  onChange,
}: ApiBuilderPairsEditorProps) {
  const nextPairs = pairs.length > 0 ? pairs : [createEmptyPair()];

  return (
    <div className="api-pairs-editor">
      <div className="api-pairs-editor__header">
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        <button
          className="ghost-button"
          type="button"
          onClick={() => onChange([...nextPairs, createEmptyPair()])}
        >
          Add row
        </button>
      </div>

      <div className="api-pairs-editor__rows">
        {nextPairs.map((pair, index) => (
          <div className="api-pairs-editor__row" key={pair.id}>
            <input
              value={pair.key}
              onChange={(event) => {
                const updatedPairs = [...nextPairs];
                updatedPairs[index] = {
                  ...pair,
                  key: event.target.value,
                };
                onChange(updatedPairs);
              }}
              placeholder={keyPlaceholder}
            />
            <input
              value={pair.value}
              onChange={(event) => {
                const updatedPairs = [...nextPairs];
                updatedPairs[index] = {
                  ...pair,
                  value: event.target.value,
                };
                onChange(updatedPairs);
              }}
              placeholder={valuePlaceholder}
            />
            <button
              className="ghost-button"
              type="button"
              onClick={() =>
                onChange(
                  nextPairs.length === 1
                    ? [createEmptyPair()]
                    : nextPairs.filter((item) => item.id !== pair.id),
                )
              }
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
