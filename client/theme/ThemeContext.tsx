import React, {
  createContext,
  useContext,
  useState
} from 'react';
import { useColorScheme } from 'react-native';

import { space } from './spacing';
import { borderRadius } from './borderRadius';
import { lightColors, darkColors } from './colors';
import { fontSize, fontFamily, fontWeight, lineHeight } from './typography';


const buildTheme = (scheme: 'light' | 'dark') => ({
  color: scheme === 'dark' ? darkColors : lightColors,
  space,
  fontSize,
  fontFamily,
  fontWeight,
  lineHeight,
  borderRadius,
  isDark: scheme === 'dark',
});

type Theme = ReturnType<typeof buildTheme>;

const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
} | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme() ?? 'light';
  const [scheme, setScheme] = useState<'light' | 'dark'>(
    systemScheme === 'dark' ? 'dark' : 'light'
  );

  const toggleTheme = () =>
    setScheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  return (
    <ThemeContext.Provider value={{ theme: buildTheme(scheme), toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
