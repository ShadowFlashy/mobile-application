import 'i18next';
import type en from '../i18n/locales/en.json';

// Makes t('key') type safe: a key that does not exist in en.json is a compile error.
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: { translation: typeof en };
  }
}
