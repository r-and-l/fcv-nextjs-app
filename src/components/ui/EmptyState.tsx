export function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 text-sm shadow-sm">
      {message}
    </div>
  );
}
