'use client';

import { Suspense, useEffect, useState, ReactNode } from 'react';
import { TelegramProvider } from '@/components/providers/TelegramProvider';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

interface TelegramAppProps {
  children: ReactNode;
  suspense?: boolean;
}

export function TelegramApp({ children, suspense = false }: TelegramAppProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const content = suspense ? (
    <Suspense fallback={<LoadingScreen />}>{children}</Suspense>
  ) : (
    children
  );

  return <TelegramProvider>{content}</TelegramProvider>;
}
