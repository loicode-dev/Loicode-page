/** Convierte un texto en slug para URLs: "¡Hola Mundo!" → "hola-mundo" */
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** "a, b , c" → ['a','b','c'] */
export function splitList(text: string, separator: RegExp = /[,\n]/): string[] {
  return text
    .split(separator)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function whatsappLink(phone: string, message: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

