import { useEffect } from 'react';
import { brand } from '../config/brand';

export function usePageMeta(titleSuffix?: string, description?: string) {
  useEffect(() => {
    const fullTitle = titleSuffix
      ? `${titleSuffix} — ${brand.name}`
      : `${brand.name} — ${brand.tagline}`;
    document.title = fullTitle;

    const desc =
      description ||
      `${brand.name} is an AI sales agent that takes a business's website URL, discovers who buys from them, finds and verifies leads, writes personalized cold emails, and handles meeting booking.`;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', desc);
  }, [titleSuffix, description]);
}
