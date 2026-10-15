/**
 * Colección persistida en localStorage. Solo se usa en MODO DEMO
 * (cuando Supabase no está configurado) para que el admin sea funcional.
 */
export class LocalCollection<T extends { id: string }> {
  constructor(
    private readonly key: string,
    private readonly seed: () => T[],
  ) {}

  all(): T[] {
    try {
      const raw = localStorage.getItem(this.key);
      if (raw) return JSON.parse(raw) as T[];
    } catch {
      /* ignore */
    }
    const initial = this.seed();
    this.save(initial);
    return initial;
  }

  find(predicate: (item: T) => boolean): T | undefined {
    return this.all().find(predicate);
  }

  insert(item: Omit<T, 'id'> & Partial<Pick<T, 'id'>>): T {
    const record = { ...item, id: item.id ?? uid() } as T;
    this.save([record, ...this.all()]);
    return record;
  }

  update(id: string, patch: Partial<T>): T {
    let updated: T | undefined;
    const items = this.all().map((it) => {
      if (it.id !== id) return it;
      updated = { ...it, ...patch, id };
      return updated;
    });
    if (!updated) throw new Error('Registro no encontrado');
    this.save(items);
    return updated;
  }

  remove(id: string): void {
    this.save(this.all().filter((it) => it.id !== id));
  }

  reset(): void {
    localStorage.removeItem(this.key);
  }

  private save(items: T[]): void {
    localStorage.setItem(this.key, JSON.stringify(items));
  }
}

export function uid(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function nowIso(): string {
  return new Date().toISOString();
}

