import { useEffect } from 'react';
import { BRAND_CONFIG } from '../config/brand';

interface SEOOptions {
  title: string;
  description: string;
  jsonLd?: Record<string, unknown>;
}

export function useSEO({ title, description, jsonLd }: SEOOptions) {
  useEffect(() => {
    const fullTitle = title.includes(BRAND_CONFIG.name) ? title : `${title} — ${BRAND_CONFIG.name}`;
    document.title = fullTitle;

    const setMeta = (selector: string, attr: 'name' | 'property', key: string, content: string) => {
      let el = document.querySelector<HTMLMetaElement>(selector);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    setMeta('meta[name="description"]', 'name', 'description', description);
    setMeta('meta[property="og:title"]', 'property', 'og:title', fullTitle);
    setMeta('meta[property="og:description"]', 'property', 'og:description', description);
    setMeta('meta[property="og:url"]', 'property', 'og:url', window.location.origin + window.location.pathname);

    let script = document.getElementById('edupick-dynamic-jsonld') as HTMLScriptElement | null;
    if (jsonLd) {
      if (!script) {
        script = document.createElement('script');
        script.id = 'edupick-dynamic-jsonld';
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(jsonLd);
    } else if (script) {
      script.remove();
    }
  }, [title, description, jsonLd]);
}
