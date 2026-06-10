import { Platform } from 'react-native';
import { I18n as I18nEngine } from 'i18n-js';
import { getLocales } from 'expo-localization';

import en from './en.json';
import hi from './hi.json';
import hinglish from './hinglish.json';


type Language = {
  code: string;
  label: string;
};

export const SupportedLanguages: Language[] = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'hinglish', label: 'Hinglish' },
  { code: 'ka', label: 'ಕನ್ನಡ' },
  { code: 'es', label: 'Español' },
];

const deviceLocale: string = getLocales()[0].languageCode ?? 'en';

export function getLocaleProvider(locale = deviceLocale): I18nEngine {
  const i18n = new I18nEngine({ en, hi, hinglish });
  i18n.locale = locale;
  i18n.defaultLocale = 'en';
  i18n.enableFallback = true;
  i18n.missingBehavior = 'guess';

  const looksLikeI18nKey = (value: string) =>
    /^[a-z0-9][a-z0-9_.-]*$/i.test(value);

  const tOriginal = i18n.t.bind(i18n);
  i18n.t = (scope: any, options?: any) => {
    if (scope == null) return '';
    if (typeof scope === 'string') {
      if (scope.startsWith('{{') && scope.endsWith('}}'))
        return scope.slice(2, -2);
      if (!looksLikeI18nKey(scope)) return scope;
    }
    return tOriginal(scope, options);
  };

  if (Platform.OS === 'web') {
    const lang = new URLSearchParams(window.location.search)
      .get('locale')
      ?.trim();
    if (lang) i18n.locale = lang;
  }

  return i18n;
}
