'use client';

type ScoreValue = number | '';

function ScoreInput({
  value,
  onChange,
}: {
  value: ScoreValue;
  onChange: (v: ScoreValue) => void;
}) {
  return (
    <div className="flex flex-col items-center space-y-1">
      <button
        type="button"
        onClick={() => onChange((value === '' ? 0 : value) + 1)}
        className="w-10 h-8 flex items-center justify-center bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-lg text-lg font-bold"
      >
        +
      </button>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
        className="w-12 h-12 text-center text-xl font-bold bg-zinc-100 dark:bg-zinc-800 rounded-xl border-none outline-none"
      />
      <button
        type="button"
        onClick={() => onChange(Math.max(0, (value === '' ? 0 : value) - 1))}
        className="w-10 h-8 flex items-center justify-center bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-lg text-lg font-bold"
      >
        -
      </button>
    </div>
  );
}

export function ScoreEditor({
  score1,
  score2,
  onScore1Change,
  onScore2Change,
  size = 'md',
}: {
  score1: ScoreValue;
  score2: ScoreValue;
  onScore1Change: (v: ScoreValue) => void;
  onScore2Change: (v: ScoreValue) => void;
  size?: 'sm' | 'md';
}) {
  const separatorClass = size === 'sm' ? 'text-xl font-bold text-zinc-300' : 'text-2xl font-bold text-zinc-300';

  return (
    <div className="flex items-center space-x-3">
      <ScoreInput value={score1} onChange={onScore1Change} />
      <span className={separatorClass}>:</span>
      <ScoreInput value={score2} onChange={onScore2Change} />
    </div>
  );
}
