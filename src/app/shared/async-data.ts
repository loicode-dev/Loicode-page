import { signal } from '@angular/core';

/** Pequeño contenedor reactivo para datos asíncronos (valor + cargando + error). */
export class AsyncData<T> {
  readonly value = signal<T | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  private seq = 0;

  async run(fn: () => Promise<T>): Promise<T | null> {
    const id = ++this.seq;
    this.loading.set(true);
    this.error.set(null);
    try {
      const v = await fn();
      if (id === this.seq) this.value.set(v);
      return v;
    } catch (e) {
      console.error(e);
      if (id === this.seq) this.error.set(errorMessage(e));
      return null;
    } finally {
      if (id === this.seq) this.loading.set(false);
    }
  }
}

export function errorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (e && typeof e === 'object' && 'message' in e) return String((e as { message: unknown }).message);
  return 'Ocurrió un error inesperado';
}

