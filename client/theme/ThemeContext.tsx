import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { space } from './spacing';
import { borderRadius } from './borderRadius';
import { lightColors, darkColors } from './colors';
import { getLocaleProvider, SupportedLanguages } from '../i18n';
import { fontSize, fontFamily, fontWeight, lineHeight } from './typography';


const THEME_STORAGE_KEY = 'medquel:theme';

const buildTheme = (scheme: 'light' | 'dark', locale: string) => ({
  color: scheme === 'dark' ? darkColors : lightColors,
  space,
  fontSize,
  fontFamily,
  fontWeight,
  lineHeight,
  borderRadius,
  isDark: scheme === 'dark',
  i18n: getLocaleProvider(locale),
});

type Theme = ReturnType<typeof buildTheme>;
const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
  setLocale: (locale: string) => void;
  currentLocale: string;
} | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [scheme, setScheme] = useState<'light' | 'dark'>('dark');
  const [locale, setLocaleState] = useState<string>('en');

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((storedScheme) => {
        if (storedScheme === 'light' || storedScheme === 'dark') {
          setScheme(storedScheme);
        }
      })
      .catch(() => {});
  }, []);

  const toggleTheme = () => {
    setScheme((prev) => {
      const nextScheme = prev === 'light' ? 'dark' : 'light';
      AsyncStorage.setItem(THEME_STORAGE_KEY, nextScheme).catch(() => {});
      return nextScheme;
    });
  };

  const setLocale = (code: string) => {
    const valid = SupportedLanguages.find((l) => l.code === code);
    if (valid) setLocaleState(code);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: buildTheme(scheme, locale),
        toggleTheme,
        setLocale,
        currentLocale: locale,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
