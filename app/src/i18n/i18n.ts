// i18n.ts
import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';

import { en } from './locales/en';
import { hi } from './locales/hi';
import { ta } from './locales/ta';
import { ml } from './locales/ml';
import { bn } from './locales/bn';

// Create a new i18n instance
const i18n = new I18n({
  en,
  hi,
  ta,
  ml,
  bn,
});

i18n.enableFallback = true;

// Extract only the language code from the device locale
const deviceLanguage = Localization.getLocales()[0]?.languageCode || 'en';
i18n.locale = deviceLanguage;

export default i18n;
