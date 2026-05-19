import { ReactNode } from 'react';

export function PageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-black dark:text-white p-4">
      <div className="max-w-md mx-auto space-y-6">{children}</div>
    </div>
  );
}
