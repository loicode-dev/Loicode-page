import { Pipe, PipeTransform } from '@angular/core';
import { marked } from 'marked';

marked.setOptions({ gfm: true, breaks: true });

/**
 * Convierte Markdown a HTML. Úsalo con [innerHTML]; Angular sanitiza el resultado
 * (elimina scripts y atributos peligrosos) automáticamente.
 */
@Pipe({ name: 'markdown' })
export class MarkdownPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    return marked.parse(value, { async: false }) as string;
  }
}

