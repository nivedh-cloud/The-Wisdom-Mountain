export function localized(obj, fieldBase, lang) {
  if (!obj) return '';
  if (lang === 'te') {
    return obj[`${fieldBase}Te`] || obj[`${fieldBase}Telugu`] || obj[fieldBase] || '';
  }
  return obj[fieldBase] || '';
}

export function pick(obj, fieldBase, lang) {
  // Returns either the localized value or the English fallback (useful for lists)
  return localized(obj, fieldBase, lang);
}
