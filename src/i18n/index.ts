import { uz, type TranslationDictionary } from './uz';
import { ru } from './ru';
import { en } from './en';
import type { Language } from '../types/domain';

export const DICTIONARIES: Record<Language, TranslationDictionary> = {
  uz,
  ru,
  en,
};

export function getDictionary(lang: Language): TranslationDictionary {
  return DICTIONARIES[lang] || uz;
}
