import { ReactNode } from 'react';

export function PageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen p-4 pb-12">
      <div className="max-w-md mx-auto space-y-5 animate-fade-in">{children}</div>
    </div>
  );
}
