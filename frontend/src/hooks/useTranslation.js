// Re-export pattern so components don't need to know LangContext exists
import { useLang } from '../context/LangContext.jsx';
export function useTranslation() {
  const { t, lang, setLang, toggleLang, isRTL } = useLang();
  return { t, lang, setLang, toggleLang, isRTL };
}
