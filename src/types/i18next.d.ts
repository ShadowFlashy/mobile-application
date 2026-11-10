import 'i18next';
import type { Resources } from '../i18n/resources';

// Makes t('key') type safe: a key that does not exist in the English namespace files is a compile error.
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: { translation: Resources };
  }
}
