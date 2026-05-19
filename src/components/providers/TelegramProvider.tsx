'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import WebApp from '@twa-dev/sdk';
import { TelegramUser } from '@/types/telegram';

interface TelegramContextType {
  initData: string;
  user: TelegramUser | null;
  isReady: boolean;
  startParam?: string;
  chat?: { id: number, type: string, title: string };
}

const TelegramContext = createContext<TelegramContextType>({
  initData: '',
  user: null,
  isReady: false,
  startParam: undefined,
  chat: undefined,
});

export function useTelegram() {
  return useContext(TelegramContext);
}

const TELEGRAM_TEST_ENABLED = process.env.NEXT_PUBLIC_TELEGRAM_TEST_ENABLED === 'true';

function getLocalTelegramUser(): TelegramUser | null {
  const id = process.env.NEXT_PUBLIC_TELEGRAM_TEST_USER_ID;
  if (!id) return null;

  return {
    id: Number(id),
    first_name: process.env.NEXT_PUBLIC_TELEGRAM_TEST_USER_FIRST_NAME || 'Test',
    last_name: process.env.NEXT_PUBLIC_TELEGRAM_TEST_USER_LAST_NAME,
    username: process.env.NEXT_PUBLIC_TELEGRAM_TEST_USER_USERNAME,
  } as TelegramUser;
}

function getLocalTelegramChat() {
  const id = process.env.NEXT_PUBLIC_TELEGRAM_TEST_CHAT_ID;
  if (!id) return undefined;

  return {
    id: Number(id),
    type: process.env.NEXT_PUBLIC_TELEGRAM_TEST_CHAT_TYPE || 'group',
    title: process.env.NEXT_PUBLIC_TELEGRAM_TEST_CHAT_TITLE || 'Local Telegram chat',
  };
}

export function TelegramProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [initData, setInitData] = useState('');
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [startParam, setStartParam] = useState<string | undefined>();
  const [chat, setChat] = useState<any>();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLocalhost =
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname === '[::1]';
      const useLocalTelegramFallback = isLocalhost && TELEGRAM_TEST_ENABLED;
      const localUser = getLocalTelegramUser();
      const localChat = getLocalTelegramChat();
      const localInitData = process.env.NEXT_PUBLIC_TELEGRAM_TEST_INIT_DATA || '';
      const localStartParam = process.env.NEXT_PUBLIC_TELEGRAM_TEST_START_PARAM;

      try {
        WebApp.ready();
        setInitData(WebApp.initData);
        if (WebApp.initDataUnsafe?.user) {
          setUser(WebApp.initDataUnsafe.user as TelegramUser);
        }
        if (WebApp.initDataUnsafe?.start_param) {
          setStartParam(WebApp.initDataUnsafe.start_param);
        }
        if (WebApp.initDataUnsafe?.chat) {
          setChat(WebApp.initDataUnsafe.chat);
        }
      } catch (error) {
        console.error('Telegram WebApp error:', error);
      } finally {
        if (useLocalTelegramFallback) {
          setInitData((value) => value || localInitData);
          setUser((value: TelegramUser | null) => value || localUser);
          setStartParam((value) => value || localStartParam);
          setChat((value: any) => value || localChat);
        }
        setIsReady(true);
      }
    }
  }, []);

  return (
    <TelegramContext.Provider value={{ initData, user, isReady, startParam, chat }}>
      {children}
    </TelegramContext.Provider>
  );
}
